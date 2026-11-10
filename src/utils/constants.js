import os from "os";
import path from "path";

export const HOME_DIR = os.homedir();

export const CONFIG_DIR = path.join(os.homedir(),".jarvis"); 
