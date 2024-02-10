const express = require("express");
const app = express();
const {
  sports,
  matches,
  sessions,
  player: playerModel,
  admin: adminModel,
} = require("./models");
const path = require("path");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const sess = require("express-session");
const connectEnsureLogin = require("connect-ensure-login");
const saltRounds = 10;
// Middleware for parsing JSON and URL-encoded data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.use(
  sess({
    secret: "my-secret-key-127287123873",
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, //24hours
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (username, password, done) => {
      const admin = await adminModel.findOne({ where: { email: username } });
      const player = await playerModel.findOne({ where: { email: username } });

      if (admin) {
        const result = await bcrypt.compare(password, admin.password);
        if (result) {
          global.adminFirstName = admin.first;
          global.adminLastName = admin.last;
          global.adminEmail = admin.email;
          return done(null, { user: admin, type: "admin" });
        } else {
          return done(null, false, { message: "Invalid password" });
        }
      } else if (player) {
        const result = await bcrypt.compare(password, player.password);
        if (result) {
          // User is a Player
          global.userFullname = player.fullname;
          global.userEmail = player.email;
          return done(null, { user: player, type: "player" });
        } else {
          return done(null, false, { message: "Invalid password" });
        }
      } else {
        return done(null, false, { message: "User not found" });
      }
    }
  )
);

passport.serializeUser((userObject, done) => {
  const { user, type } = userObject;
  console.log(`serializing ${type}`, user.id);
  done(null, { id: user.id, type });
});

passport.deserializeUser((serializedUser, done) => {
  const { id, type } = serializedUser;

  if (type === "admin") {
    adminModel
      .findByPk(id)
      .then((user) => {
        done(null, user);
      })
      .catch((error) => {
        done(error, null);
      });
  } else if (type === "player") {
    playerModel
      .findByPk(id)
      .then((user) => {
        done(null, user);
      })
      .catch((error) => {
        done(error, null);
      });
  } else {
    done(null, false, { message: "Invalid user type during deserialization" });
  }
});

passport.serializeUser((user, done) => {
  console.log("serializing user in session", user.id);
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  playerModel
    .findByPk(id)
    .then((user) => {
      done(null, user);
    })
    .catch((error) => {
      done(error, null);
    });
});
app.get("/", (request, response) => {
  response.render("main");
});

app.post("/create-player", async (req, res) => {
  try {
    // create account for player
    const { first, last, email, password } = req.body;
    const him = "successfully created accountll";
    // console.log(req.body)
    if (!first || !last || !email || !password) {
      return res.status(400).json({ error: "All fields are required." });
    }
    const firstName = first;
    const lastName = last;
    const hashedPwd = await bcrypt.hash(password, saltRounds);
    const newPlayers = await playerModel.create({
      first: firstName,
      last: lastName,
      email,
      password: hashedPwd,
      fullname: firstName + lastName,
    });
    console.log(newPlayers);
    res.render("login", { him });
  } catch (error) {
    console.error("Error creating Player:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/create-players", async (req, res) => {
  try {
    const { first, last, email, password } = req.body;
    const him = "successfully created account";
    // console.log(req.body)
    if (!first || !last || !email || !password) {
      return res.status(400).json({ error: "All fields are required." });
    }
    const firstName = first;
    const lastName = last;
    const hashedPwd = await bcrypt.hash(password, saltRounds);
    const newPlayer = await adminModel.create({
      first: firstName,
      last: lastName,
      email,
      password: hashedPwd,
    });
    // console.log(newPlayer)
    res.render("login", { him });
    // req.login(newPlayer, (err) => {
    //   if (err) {
    //     console.log(err);
    //   }
    //   res.redirect("/player");
    // });
  } catch (error) {
    console.error("Error creating Player:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// section player

app.post(
  "/sectionPlayer",
  passport.authenticate("local", {
    failureRedirect: "/login",
  }),
  connectEnsureLogin.ensureLoggedIn(),
  (request, response) => {
    response.redirect("/user");
  }
);

app.post(
  "/sectionAdmin",
  passport.authenticate("local", {
    failureRedirect: "/login",
  }),
  connectEnsureLogin.ensureLoggedIn(),
  (request, response) => {
    response.redirect(`/admin`);
  }
);

app.get("/signup", (request, response) => {
  let him = "successfully created account";
  response.render("signup", { him });
});
app.get("/sigupadmin", (request, response) => {
  let him = "successfully created account";
  response.render("sigupadmin", { him });
});
app.get("/forgotuser", (request, response) => {
  let him = "password reset successfull";
  response.render("forgotuser", { him });
});
app.get("/forgotadmin", (request, response) => {
  let him = "password reset successfull";
  response.render("forgotadmin", { him });
});

// app.get("/createsport11", (request, response) => {
//    const adminName = global.adminFirstName+global.adminLastName;
//     const adminEmail=global.adminEmail
//     console.log("Email :",adminEmail,"Name",adminName)
//     if (adminEmail==undefined || adminName==undefined) {
//       res.redirect('login');
//     }
//     const sportsList = await sports.findAll();
//     const matchesList = await matches.findAll();
//     const sessionData = await sessions.findAll();
//   response.render("createsport", { sports: sportsList, matches: matchesList, sessionData,adminName,adminEmail}); // Assuming you have a createsport.ejs file
// });

// app.get("/creatematch11", (request, response) => {
//   response.render("creatematch.ejs"); // Assuming you have a creatematch.ejs file
// });

// app.get("/joinmatch11", (request, response) => {
//   response.render("joinmatch"); // Assuming you have a joinmatch.ejs file
// });

// app.get("/displayall11", (request, response) => {
//   response.render("displayall"); // Assuming you have a displayall.ejs file
// });

app.get("/login", async (request, response) => {
  global.adminEmail = undefined;
  global.userEmail = undefined;
  const him = request.body.him || "";
  console.log(him, request.query.him);
  response.render("login", { him });
});

app.post("/forgotad", async (req, res) => {
  try {
    // create account for admin
    const { first, last, email, password } = req.body;
    const him = "your password is updated";
    if (!first || !last || !email || !password) {
      return res.status(400).json({ error: "All fields are required." });
    }
    const firstName = first;
    const lastName = last;
    const hashedPwd = await bcrypt.hash(password, saltRounds);

    // Assuming your model is named adminModel
    const existingAdmin = await adminModel.findOne({
      where: {
        first: firstName,
        last: lastName,
        email: email,
      },
    });

    if (existingAdmin) {
      // If the admin exists, update the password
      await existingAdmin.update({
        password: hashedPwd,
      });
      res.render("login", { him });
    } else {
      res.status(404).json({ error: "Admin not found." });
    }
  } catch (error) {
    console.error("Error updating password:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/forgot", async (req, res) => {
  try {
    // create account for player
    const { first, last, email, password } = req.body;
    const him = "your password is updated";

    if (!first || !last || !email || !password) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const firstName = first;
    const lastName = last;
    const hashedPwd = await bcrypt.hash(password, saltRounds);
    const existingPlayer = await playerModel.findOne({
      where: {
        first: firstName,
        last: lastName,
        email: email,
      },
    });

    if (existingPlayer) {
      // If the player exists, update the password
      await existingPlayer.update({
        password: hashedPwd,
      });
      res.render("login", { him });
    } else {
      res.status(404).json({ error: "Player not found." });
    }
  } catch (error) {
    console.error("Error updating password:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/signout", (request, response, next) => {
  request.logout((err) => {
    if (err) {
      return next(err);
    }
    response.redirect("/");
  });
});
app.get("/admin", async (req, res) => {
  try {
    const adminName = global.adminFirstName + global.adminLastName;
    const adminEmail = global.adminEmail;
    const him = "please login";
    console.log("Email :", adminEmail, "Name", adminName);
    if (adminEmail == undefined || adminName == undefined) {
      res.redirect("/login?him=" + encodeURIComponent(him));
    }
    const sportsList = await sports.findAll();
    const matchesList = await matches.findAll();
    const sessionData = await sessions.findAll();
    const he = req.query.he || "deekshitha";

    console.log(he, "heidsfj");
    res.render("admin", {
      sports: sportsList,
      matches: matchesList,
      sessionData,
      adminName,
      adminEmail,
      he,
    });
  } catch (error) {
    console.error(error);
    return res.status(422).json(error);
  }
});
app.get("/user", async (req, res) => {
  try {
    const adminName = global.userFullname;
    const adminEmail = global.userEmail;
    console.log(adminEmail, adminName);
    const him = "please login";
    console.log(adminName, "email:", adminEmail);
    if (adminEmail === undefined || adminName === undefined) {
      res.redirect("/login?him=" + encodeURIComponent(him));
    }
    const he = req.query.he || "deekshitha";
    const sportsList = await sports.findAll();
    const matchesList = await matches.findAll();
    const sessionData = await sessions.findAll();
    res.render("user", {
      sports: sportsList,
      matches: matchesList,
      sessionData,
      adminName,
      adminEmail,
      he,
    });
  } catch (error) {
    console.error(error);
    return res.status(422).json(error);
  }
});

app.post("/createsport", async (req, res) => {
  const { sport, admin } = req.body;
  const he = "createsport";
  try {
    const newsport = await sports.create({
      // await sports.create({
      sport: sport,
      admin: admin,
    });
    console.log(newsport);
    res.redirect(`admin?he=${he}`);
  } catch (error) {
    console.error(error);
    return res.status(422).json(error);
  }
});

app.post("/creatematch", async (req, res) => {
  const { sport, admin, date, venue, match, teamsize, timein, timeout } =
    req.body;
  const he = "creatematch";
  // console.log(sport,timeout,typeof timein);
  // If deleteMatch is not selected, proceed with creating a new match
  try {
    const newMatch = await matches.create({
      sport: sport,
      admin: admin,
      date: date,
      venue: venue,
      match: match,
      teamsize: teamsize,
      timein: timein,
      timeout: timeout,
    });
    const adminmail = global.adminEmail;
    const usermail = global.userEmail;
    if (usermail == undefined) {
      res.redirect(`admin?he=${he}`);
    }
    if (adminmail == undefined) {
      res.redirect(`user?he=${he}`);
    }
  } catch (error) {
    console.error(error);
    return res.status(422).json(error);
  }
});

// for admin delete matches
app.post("/deletematchforms", async (req, res) => {
  try {
    const deleteMatches = req.body.deleteMatch;
    const reasons = req.body.reason;
    const he = "deletematchforms";
    console.log(deleteMatches, reasons);

    // Assuming deleteMatches and reasons are arrays of the same length
    let i = -1;
    for (let j = 0; j < reasons.length; j++) {
      if (reasons[j] !== "") {
        i = j;
        break;
      }
    }

    if (i !== -1) {
      console.log("Index of the first non-empty string:", i);
      const [sport, match] = deleteMatches[i].split(":");
      console.log("sport", sport, match);

      const matchRecord = await matches.findOne({
        where: {
          sport: sport,
          match: match,
        },
      });

      if (matchRecord) {
        // Update the 'reason' column
        await matchRecord.update({
          reason: reasons[i],
        });
        console.log(`${deleteMatches[i]} updated successfully in matches.`);
      } else {
        console.log(`${deleteMatches[i]} not found in matches.`);
      }

      // Handle the case where the record doesn't exist
      const matchRecords = await sessions.findAll({
        where: {
          sport: sport,
          match: match,
        },
      });

      if (matchRecords && matchRecords.length > 0) {
        // Update the 'reason' column for each record
        for (const record of matchRecords) {
          await record.update({
            reason: reasons[i],
          });
        }
        console.log(
          `Reason for ${deleteMatches[i]} updated successfully in sessions.`
        );
      } else {
        console.log("No data found.");
      }
    }
    const usermail = global.userEmail;
    if (usermail == undefined) {
      res.redirect(`admin?he=${he}`);
    }
  } catch (error) {
    console.error(error);
    return res.status(422).json(error);
  }
});

app.post("/deletematch", async (req, res) => {
  try {
    const deleteMatches = req.body.deleteMatch;
    const reasons = req.body.reason;
    const he = "deletematch";
    console.log(deleteMatches, reasons);
    let i = -1;
    for (let j = 0; j < reasons.length; j++) {
      if (reasons[j] !== "") {
        i = j;
        break;
      }
    }

    if (i !== -1) {
      console.log("Index of the first non-empty string:", i);
      const [sport, match] = deleteMatches[i].split(":");
      console.log("sport", sport, match);

      const matchRecord = await matches.findOne({
        where: {
          sport: sport,
          match: match,
        },
      });

      if (matchRecord) {
        await matchRecord.update({
          reason: reasons[i],
        });
        console.log(`${deleteMatches[i]} updated successfully in matches.`);
      } else {
        console.log(`${deleteMatches[i]} not found in matches.`);
      }

      // Handle the case where the record doesn't exist
      const matchRecords = await sessions.findAll({
        where: {
          sport: sport,
          match: match,
        },
      });

      if (matchRecords && matchRecords.length > 0) {
        // Update the 'reason' column for each record
        for (const record of matchRecords) {
          await record.update({
            reason: reasons[i],
          });
        }
        console.log(
          `Reason for ${deleteMatches[i]} updated successfully in sessions.`
        );
      } else {
        console.log("No data found.");
      }
    }
    const adminmail = global.adminEmail;
    const usermail = global.userEmail;
    if (usermail == undefined) {
      res.redirect(`admin?he=${he}`);
    }
    if (adminmail == undefined) {
      res.redirect(`user?he=${he}`);
    }
  } catch (error) {
    console.error(error);
    return res.status(422).json(error);
  }
});

app.post("/joinmatch", async (req, res) => {
  const { admin, selectedInfo } = req.body;
  console.log("print this ", selectedInfo);
  const he = "joinmatch";
  // Split the selectedInfo into match and sport
  const [selectedMatch, selectedSport, date, timein, timeout] =
    selectedInfo.split("#");
  console.log(selectedSport, date, admin, timein, timeout);
  try {
    // Create a new match in the 'session' table
    const newMatch1 = await sessions.create({
      sport: selectedSport,
      admin: admin,
      match: selectedMatch,
    });
    const adminmail = global.adminEmail;
    const usermail = global.userEmail;
    console.log(adminmail, usermail, "dfsx");
    if (usermail == undefined) {
      console.log(adminmail, usermail, "dfsp");

      res.redirect(`admin?he=${he}`);
    }
    if (adminmail == undefined) {
      console.log(adminmail, usermail, "dfsp");
      res.redirect(`user?he=${he}`);
    }
  } catch (error) {
    console.error(error);
    return res.status(422).json(error);
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
