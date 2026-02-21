import { JSONFilePreset } from 'lowdb/node';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const defaultPipelines = { pipelines: [] };
const defaultJournal = { entries: [] };
const defaultAgents = { agents: [] };

let pipelinesDb, journalDb, agentsDb;

export async function initDB() {
  pipelinesDb = await JSONFilePreset(path.join(__dirname, 'data', 'pipelines.json'), defaultPipelines);
  journalDb = await JSONFilePreset(path.join(__dirname, 'data', 'journal.json'), defaultJournal);
  agentsDb = await JSONFilePreset(path.join(__dirname, 'data', 'agents.json'), defaultAgents);
  return { pipelinesDb, journalDb, agentsDb };
}

export function getPipelinesDb() { return pipelinesDb; }
export function getJournalDb() { return journalDb; }
export function getAgentsDb() { return agentsDb; }
