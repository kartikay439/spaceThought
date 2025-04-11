import jwt from "jsonwebtoken";


const requestMiddleware  = (req,res,next) => {

    console.log(req.headers);
    const token = req.headers.authorization;
    if(!token){
        return res.status(401).json({
            message: "No token provided"
        })
    }

    const decodeToken = jwt.verify(token, process.env.JWT_SECRET);
    if(!decodeToken){
        return res.status(401).json({
            message: "Invalid token"
        })
    }

    // res.status(200).json({
    //     message: "success token is valid"
    // })
console.log("went to next")
    next()
}

export {requestMiddleware}