import { connectDB } from './DB/connecting.js';
import {authRouter,userRouter,messageRouter} from './modules/index.js';
import cors from 'cors';
function bootstrap(app, express){
    app.use(express.json());
    app.use(cors(
        {
            origin:"*"
        }
    ));
    connectDB();
    app.use("/auth",authRouter);
    app.use("/message",messageRouter);
    app.use("/user",userRouter);
}
export default bootstrap;