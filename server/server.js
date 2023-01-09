import fastify from "fastify";
import sensible from "@fastify/sensible"
import cors from "@fastify/cors"
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client"

dotenv.config();

const app = fastify();
app.register(sensible);
app.register(cors, {
	origin: "http://127.0.0.1:5173",
	credentials: true
})
const prisma = new PrismaClient();

app.get("/posts", async (req, res) => {
	return await commitToDb(prisma.post.findMany({
		select: {
			id: true,
			title: true
		},
	}));
});

app.get("/posts/:id", async (req, res) => {
	return await commitToDb(prisma.post.findUnique({
		where: { id: req.params.id },
		select: {
			body: true,
			title: true,
			comments: {
				orderBy: {
					created_at: "desc"
				},
				select: {
					id: true,
					message: true,
					parentId: true,
					created_at: true,
					user: {
						select: {
							id: true,
							name: true,
						}
					}
				}
			}
		}
	}));
});

async function commitToDb(promise) {
	const [error, data] = await app.to(promise);
	if (error) return app.httpErrors.internalServerError(error.message);
	return data;
};

app.listen({ port: process.env.PORT });