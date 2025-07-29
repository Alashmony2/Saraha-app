import { connectDB } from './DB/model/connecting.js';
import {authRouter,userRouter,messageRouter} from './modules/index.js';
function bootstrap(app, express){
    app.use(express.json());
    connectDB();
    app.use("/auth",authRouter);
    app.use("/message",messageRouter);
    app.use("/user",userRouter);
}
export default bootstrap;