export const corsOptions = {
    origin: '*',
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE"
}

export const socketCorsOptions = {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
}