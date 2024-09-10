import { MongoClient }  from 'mongodb'
import mongoose from 'mongoose';

const mongoURI='mongodb+srv://gunjan:45vUIhHonjxChBBG@cluster0.6olt1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
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




