import mongoose from "mongoose";

async function connect() {
  try {
    await mongoose.connect(
      "mongodb+srv://hanalhu123:TTLu1fvIhxjKwPpZ@csdl1.bbvwk.mongodb.net/light_street"
    );
    console.log("Connect successfully");
  } catch (error) {
    console.log("Connect failure");
  }
}

export default { connect };
