import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const uploadDir = path.join(process.cwd(), "public", "uploads");

export async function saveLocalFile(file: File) {
  await mkdir(uploadDir, { recursive: true });

  const ext = file.name.includes(".") ? `.${file.name.split(".").pop()}` : "";
  const filename = `${randomUUID()}${ext}`;
  const target = path.join(uploadDir, filename);
  const buffer = Buffer.from(await file.arrayBuffer());

  await writeFile(target, buffer);

  return `/uploads/${filename}`;
}
