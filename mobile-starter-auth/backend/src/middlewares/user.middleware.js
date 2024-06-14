import { unauthorizedResponse } from "../utils/api.response.js"

export default function (req, res, next){
    if(!(req.user.role == "user")) return unauthorizedResponse("Access denied! You must not be an admin to use this route!",res)
    next()
}