const { Firestore } = require("@google-cloud/firestore");
const config = require("../config");

const db = new Firestore({ projectId: config.gcpProjectId });
const blogsCollection = db.collection("blogs");

/**
 * Save a blog document to Firestore.
 * Returns the saved document data including its ID and slug.
 */
async function saveBlog({ title, content, metaDescription, keyword, imageUrl, slug, seoScore, faq }) {
  const blogData = {
    title,
    content,
    metaDescription,
    keyword,
    imageUrl,
    slug,
    seoScore: seoScore || null,
    faq: faq || [],
    status: "published",
    createdAt: Firestore.FieldValue.serverTimestamp(),
    updatedAt: Firestore.FieldValue.serverTimestamp(),
  };

  const docRef = await blogsCollection.add(blogData);

  return {
    id: docRef.id,
    ...blogData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Fetch all blogs from Firestore, ordered by creation date (newest first).
 */
async function getAllBlogs() {
  const snapshot = await blogsCollection
    .orderBy("createdAt", "desc")
    .get();

  const blogs = [];
  snapshot.forEach((doc) => {
    const data = doc.data();
    blogs.push({
      id: doc.id,
      ...data,
      createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : null,
      updatedAt: data.updatedAt ? data.updatedAt.toDate().toISOString() : null,
    });
  });

  return blogs;
}

/**
 * Fetch a single blog by ID.
 */
async function getBlogById(blogId) {
  const doc = await blogsCollection.doc(blogId).get();
  if (!doc.exists) {
    return null;
  }
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : null,
    updatedAt: data.updatedAt ? data.updatedAt.toDate().toISOString() : null,
  };
}

/**
 * Fetch a single blog by slug.
 */
async function getBlogBySlug(slug) {
  const snapshot = await blogsCollection
    .where("slug", "==", slug)
    .limit(1)
    .get();

  if (snapshot.empty) {
    return null;
  }

  const doc = snapshot.docs[0];
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : null,
    updatedAt: data.updatedAt ? data.updatedAt.toDate().toISOString() : null,
  };
}

/**
 * Fetch a single blog by keyword.
 * This is used for the smart caching layer.
 */
async function getBlogByKeyword(keyword) {
  const snapshot = await blogsCollection
    .where("keyword", "==", keyword.toLowerCase())
    .orderBy("createdAt", "desc")
    .limit(1)
    .get();

  if (snapshot.empty) {
    return null;
  }

  const doc = snapshot.docs[0];
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : null,
    updatedAt: data.updatedAt ? data.updatedAt.toDate().toISOString() : null,
    source: "Cloud-Cache"
  };
}

/**
 * Check if a blog with the same keyword was generated recently (within last hour).
 * Prevents duplicate generation.
 */
async function checkRecentDuplicate(keyword) {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  const snapshot = await blogsCollection
    .where("keyword", "==", keyword.toLowerCase())
    .where("createdAt", ">", oneHourAgo)
    .limit(1)
    .get();

  return !snapshot.empty;
}

/**
 * Get all existing slugs (for unique slug generation).
 */
async function getAllSlugs() {
  const snapshot = await blogsCollection.select("slug").get();
  return snapshot.docs.map((doc) => doc.data().slug).filter(Boolean);
}

module.exports = { saveBlog, getAllBlogs, getBlogById, getBlogBySlug, checkRecentDuplicate, getBlogByKeyword, getAllSlugs };
