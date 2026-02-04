const exp = require('express')
const cros = require('cors')
const jwt = require("jsonwebtoken")
const crypto = require('crypto')
const bcrypt = require('bcrypt')

const app = exp()
const User = require("./model/Users")
const note = require("./model/Note")


app.use(cros())
app.use(exp.json())
app.use(exp())
const secret = "MYstack"
const verify = (req, res, next) => {
  const token = req.headers.authorization;
  console.log(req.headers.authorization)

  if (!token) {
    return res.status(401).json({ messassge: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ status:false, message: "Invalid token" });
  }
};


app.post("/api/v1/signup",async (rq, rs) => {
  console.log(rq.body)

  const userEmailCheck = await User.findOne({ email: rq.body.email })
  console.log()
  if (userEmailCheck) {
    return rs.json({ message: "email already registerd", status: false })
  }
  const hashpass = await bcrypt.hash(rq.body.password, 10)
  const data = await User.create({
    name: rq.body.name,
    email: rq.body.email,
    password: hashpass,
    role: rq.body.role
  })
  delete data.password
  rs.json({ status: true, message: "Resgistration successfull" })
})

app.post("/api/v1/Login", async (rq, rs) => {
  try {
    console.log(rq.body)
    const userNameCheck = await User.findOne({ email: rq.body.email })

    if (!userNameCheck) {
      console.log("in noot fou f")
      return rs.json({ message: "Not a Valid User", status: false })
    }
    const passcheck = await bcrypt.compare(rq.body.password, userNameCheck.password)
    console.log(passcheck)
    if (passcheck) {
      delete userNameCheck.password
      const token = jwt.sign({ _id: userNameCheck._id, username: userNameCheck.username }, secret,
        { expiresIn: "24h" }
      )
      console.log(userNameCheck)
      rs.json({ user: userNameCheck, status: true, token: token })
    }
    else {
      rs.json({ status: false, message: "Invalid Credentials" })
    }
  }
  catch (error) {
    console.log(error)
  }
})

app.post("/api/v1/addnote",verify, async (req, res) => {
  try {
 console.log(req.body)
    const movie1 = await note.create({
      title: req.body.title,
     userid:req.body.userId,
      content: req.body.content
    });

    res.json({
      status: true,
      message: "notes added successfully",
      
    });
  } catch (error) {
    console.log(error)
    res.json({
      status: false,
      message: error.message || "Error adding notes",

    });
  }
})

app.get("/api/v1/notes/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;

    const skip = (page - 1) * limit;

    const totalNotes = await note.countDocuments({ userid: userId });

    const notes = await note
      .find({ userid: userId })
      .sort({ _id: -1 })       
      .skip(skip)
      .limit(limit);

    res.json({
      status: true,
      message: "Notes fetched successfully",
      data: notes,
      pagination: {
        totalNotes,
        currentPage: page,
        totalPages: Math.ceil(totalNotes / limit),
        limit,
      },
    });

  } catch (error) {
    console.log(error);
    res.json({
      status: false,
      message: error.message || "Error fetching notes",
    });
  }
});
app.get("/api/v1/note/:id", async (req, res) => {
  try {
    const { id } = req.params; 
    const notes = await note.find({ _id: id })
    res.json({
      status: true,
      message: "Notes fetched successfully",
      data: notes[0],
     
    });

  } catch (error) {
    console.log(error);
    res.json({
      status: false,
      message: error.message || "Error fetching notes",
    });
  }
});

app.put("/api/v1/editnote/:id",verify, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    const updatedNote = await note.findByIdAndUpdate(
      id,
      {
        title: title,
        content: content,
      },
      { new: true } 
    );

    if (!updatedNote) {
      return res.json({
        status: false,
        message: "Note not found",
      });
    }

    res.json({
      status: true,
      message: "Note updated successfully",
      data: updatedNote,
    });
  } catch (error) {
    console.log(error);
    res.json({
      status: false,
      message: error.message || "Error updating note",
    });
  }
});

app.delete("/api/v1/deletenote/:id",verify, async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!id) {
      return res.json({
        status: false,
        message: "Note id is required",
      });
    }

    const deletedNote = await note.findOneAndDelete({
      _id: id,
      userid: userId, 
    });

    if (!deletedNote) {
      return res.json({
        status: false,
        message: "Note not found or unauthorized",
      });
    }

    res.json({
      status: true,
      message: "Note deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.json({
      status: false,
      message: error.message || "Error deleting note",
    });
  }
});

app.get("/api/v1/searchnotes", async (req, res) => {
  try {
    const { query, userId } = req.query;

    if (!userId) {
      return res.json({
        status: false,
        message: "User id is required",
      });
    }

    const searchFilter = {
      userid: userId,
    };

    if (query) {
      searchFilter.$or = [
        { title: { $regex: query, $options: "i" } },
        { content: { $regex: query, $options: "i" } },
      ];
    }

    const notes = await note.find(searchFilter).sort({ createdAt: -1 });

    res.json({
      status: true,
      data: notes,
    });
  } catch (error) {
    console.error(error);
    res.json({
      status: false,
      message: error.message || "Error searching notes",
    });
  }
});

app.get("/api/v1/user/:id",verify, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("-password"); 
    

    if (!user) {
      return res.json({ status: false, message: "User not found" });
    }

    res.json({ status: true, data: user });
  } catch (error) {
    console.log(error);
    res.json({ status: false, message: error.message });
  }
});

app.put("/api/v1/user/:id", verify,async (rq, rs) => {
  try {
    console.log(rq.body);

    const { name, email, password } = rq.body;

  
    const existingUser = await User.findById(rq.params.id);
    if (!existingUser) {
      return rs.json({ status: false, message: "User not found" });
    }

   
    if (email && email !== existingUser.email) {
      const userEmailCheck = await User.findOne({ email });
      if (userEmailCheck) {
        return rs.json({ status: false, message: "Email already registered" });
      }
    }

  
    if (name) existingUser.name = name;
    if (email) existingUser.email = email;
    if (password && password.trim() !== "") {
      const hashpass = await bcrypt.hash(password, 10);
      existingUser.password = hashpass;
    }

    await existingUser.save();

  
    const UserResponse = existingUser.toObject();
    delete UserResponse.password;

    rs.json({ status: true, message: "Profile updated successfully", data: UserResponse });
  } catch (err) {
    console.log(err);
    rs.json({ status: false, message: "Something went wrong" });
  }
});



app.listen(5000, () => {
  console.log("server started")
})