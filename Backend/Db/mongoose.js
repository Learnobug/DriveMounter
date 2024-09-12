import { MongoClient }  from 'mongodb'
import mongoose from 'mongoose';
import { configDotenv } from 'dotenv';

configDotenv();

const mongoURI=process.env.DB_URI
const client = new MongoClient(mongoURI, { serverSelectionTimeoutMS: 60000,
    useNewUrlParser: true,
    useUnifiedTopology: true,
 });
 mongoose.set('strictQuery', false);
const connectToDatabase = async () => {
    try {
        mongoose.connect(mongoURI).then(() => {
            console.log(`successfully connected`);
          }).catch((e) => {
            console.log(`not connected`);
          }); 
    } catch (err) {
        console.log(err.stack);
    }
    finally {
        await client.close();
    }
};

export { connectToDatabase };




