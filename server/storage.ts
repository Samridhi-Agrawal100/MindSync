import { db } from "./db";
import { projects, tasks, notes, links } from "@shared/schema";
import { eq, and, desc, asc } from "drizzle-orm";
import type { Project, InsertProject, Task, InsertTask, Note, InsertNote, Link, InsertLink } from "@shared/schema";

export interface IStorage {
  getProjects(userId: string): Promise<Project[]>;
  createProject(data: InsertProject): Promise<Project>;
  updateProject(id: string, userId: string, data: Partial<InsertProject>): Promise<Project | null>;
  deleteProject(id: string, userId: string): Promise<boolean>;

  getTasks(userId: string): Promise<Task[]>;
  createTask(data: InsertTask): Promise<Task>;
  updateTask(id: string, userId: string, data: Partial<InsertTask>): Promise<Task | null>;
  deleteTask(id: string, userId: string): Promise<boolean>;

  getNotes(userId: string): Promise<Note[]>;
  createNote(data: InsertNote): Promise<Note>;
  updateNote(id: string, userId: string, data: Partial<InsertNote>): Promise<Note | null>;
  deleteNote(id: string, userId: string): Promise<boolean>;

  getLinks(userId: string): Promise<Link[]>;
  createLink(data: InsertLink): Promise<Link>;
  deleteLink(id: string, userId: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getProjects(userId: string): Promise<Project[]> {
    return db.select().from(projects).where(eq(projects.userId, userId)).orderBy(desc(projects.createdAt));
  }

  async createProject(data: InsertProject): Promise<Project> {
    const [project] = await db.insert(projects).values(data).returning();
    return project;
  }

  async updateProject(id: string, userId: string, data: Partial<InsertProject>): Promise<Project | null> {
    const [project] = await db.update(projects)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(projects.id, id), eq(projects.userId, userId)))
      .returning();
    return project ?? null;
  }

  async deleteProject(id: string, userId: string): Promise<boolean> {
    const result = await db.delete(projects).where(and(eq(projects.id, id), eq(projects.userId, userId))).returning();
    return result.length > 0;
  }

  async getTasks(userId: string): Promise<Task[]> {
    return db.select().from(tasks).where(eq(tasks.userId, userId)).orderBy(desc(tasks.createdAt));
  }

  async createTask(data: InsertTask): Promise<Task> {
    const [task] = await db.insert(tasks).values(data).returning();
    return task;
  }

  async updateTask(id: string, userId: string, data: Partial<InsertTask>): Promise<Task | null> {
    const [task] = await db.update(tasks)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
      .returning();
    return task ?? null;
  }

  async deleteTask(id: string, userId: string): Promise<boolean> {
    const result = await db.delete(tasks).where(and(eq(tasks.id, id), eq(tasks.userId, userId))).returning();
    return result.length > 0;
  }

  async getNotes(userId: string): Promise<Note[]> {
    return db.select().from(notes).where(eq(notes.userId, userId)).orderBy(desc(notes.updatedAt));
  }

  async createNote(data: InsertNote): Promise<Note> {
    const [note] = await db.insert(notes).values(data).returning();
    return note;
  }

  async updateNote(id: string, userId: string, data: Partial<InsertNote>): Promise<Note | null> {
    const [note] = await db.update(notes)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(notes.id, id), eq(notes.userId, userId)))
      .returning();
    return note ?? null;
  }

  async deleteNote(id: string, userId: string): Promise<boolean> {
    const result = await db.delete(notes).where(and(eq(notes.id, id), eq(notes.userId, userId))).returning();
    return result.length > 0;
  }

  async getLinks(userId: string): Promise<Link[]> {
    return db.select().from(links).where(eq(links.userId, userId)).orderBy(desc(links.createdAt));
  }

  async createLink(data: InsertLink): Promise<Link> {
    const [link] = await db.insert(links).values(data).returning();
    return link;
  }

  async deleteLink(id: string, userId: string): Promise<boolean> {
    const result = await db.delete(links).where(and(eq(links.id, id), eq(links.userId, userId))).returning();
    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();
