import express, { Application, Request, Response } from 'express';

console.log("hi");

export const app: Application = express();

const PORT: number = 3001;

app.use('/version', (req: Request, res: Response): void => {
    //res.send('Hello world!');
    res.status(200).json({"version":"v0.6.0a"})
});

app.listen(PORT, (): void => {
    console.log('SERVER IS UP ON PORT:', PORT);
});

//export { app }

