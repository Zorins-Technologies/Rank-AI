const { PredictionServiceClient } = require("@google-cloud/aiplatform").v1;
const config = require("../config");

const predictionClient = new PredictionServiceClient({
  apiEndpoint: `${config.vertexLocation}-aiplatform.googleapis.com`,
});

/**
 * Generate an image using Vertex AI Imagen from a blog title.
 * Returns a Buffer of the generated PNG image.
 */
async function generateImage(blogTitle) {
  const endpoint = `projects/${config.gcpProjectId}/locations/${config.vertexLocation}/publishers/google/models/imagegeneration@006`;

  const prompt = `Create a professional, modern blog header image for an article titled: "${blogTitle}". 
Requirements:
- Clean, minimalist design with a professional color palette
- Subtle gradient background with soft lighting
- Abstract or conceptual visual representation of the topic
- NO text, NO words, NO letters, NO watermarks in the image
- High quality, suitable for a professional blog
- Modern flat design or isometric style`;

  const instance = {
    structValue: {
      fields: {
        prompt: { stringValue: prompt },
      },
    },
  };

  const parameters = {
    structValue: {
      fields: {
        sampleCount: { numberValue: 1 },
        aspectRatio: { stringValue: "16:9" },
        safetyFilterLevel: { stringValue: "block_few" },
      },
    },
  };

  const [response] = await predictionClient.predict({
    endpoint,
    instances: [instance],
    parameters,
  });

  if (
    !response.predictions ||
    response.predictions.length === 0 ||
    !response.predictions[0].structValue.fields.bytesBase64Encoded
  ) {
    throw new Error("Imagen did not return an image");
  }

  const base64Image =
    response.predictions[0].structValue.fields.bytesBase64Encoded.stringValue;

  return Buffer.from(base64Image, "base64");
}

module.exports = { generateImage };
