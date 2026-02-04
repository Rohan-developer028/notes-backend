require("../configure/config")
const mongoose = require("mongoose");

const NoteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    
    },
   
  
    content: {
      type: String,
      required: true,
    },
  

  userid:{
    type:String,
    required:true,
  }
    

  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("note", NoteSchema);
