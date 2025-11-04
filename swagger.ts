// swagger.ts
import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    }
  },
    info: {
      title: "Edubuk Trucv API Documentation",
      version: "1.0.0",
      description: "API documentation for Edubuk Trucv project",
    },
    servers: [
      {
        url: "http://localhost:8000", // your base URL
        description: "Local Development of Trucv"
      }
    ],
  },
  // Paths to files that contain OpenAPI definitions
  apis: ["./routers/*.ts", "./routers/*.js"], // or wherever your routes live
};

export const swaggerSpec = swaggerJsDoc(options);
export const swaggerUiSetup = swaggerUi;
