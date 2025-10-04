import { OAuth2Client } from "google-auth-library";
import { ApiError } from "../utils/ApiError.js";

const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

export const verifyToken = async (req, _, next) => {
    const { code } = req.body;

    if (!code) throw new ApiError("unauthorized request");

    const { tokens } = await client.getToken(code);

    const ticket = await client.verifyIdToken({
        idToken: tokens.id_token,
        audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    req.body = {
        fullName: payload.name,
        username: payload.given_name,
        avatar_url: payload.picture,
        email: payload.email,
        email_verified: payload.email_verified,
        authType: "google",
        googleId: payload.sub,
    };

    next();
};
