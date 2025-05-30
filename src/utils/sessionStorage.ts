
export interface SessionData {
  time: string;
  A_label: string;
  p_label: string;
  B_label: string;
  r_label?: string;
  C_label: string;
  model_name: string;
  use_few_shot: boolean;
  few_shot_examples: any[];
  temperature: number;
  top_p: number;
  frequency_penalty: number;
  presence_penalty: number;
  repeat_penalty: number;
  property_name?: string;
  class_name?: string;
  explanation: string;
}

export const saveSessionData = (data: SessionData): void => {
  try {
    const counter = parseInt(localStorage.getItem("sess_data_counter") || "0");
    localStorage.setItem(`sess_data_#_${counter}`, JSON.stringify(data));
    localStorage.setItem("sess_data_counter", (counter + 1).toString());
  } catch (error) {
    console.error('Error saving session data:', error);
  }
};

export const getSessionHistory = (): SessionData[] => {
  try {
    const counter = parseInt(localStorage.getItem("sess_data_counter") || "0");
    const sessions: SessionData[] = [];
    
    for (let i = 0; i < counter; i++) {
      const data = localStorage.getItem(`sess_data_#_${i}`);
      if (data) {
        try {
          sessions.push(JSON.parse(data));
        } catch (parseError) {
          console.error(`Error parsing session data ${i}:`, parseError);
        }
      }
    }
    
    return sessions;
  } catch (error) {
    console.error('Error getting session history:', error);
    return [];
  }
};

export const clearSessionHistory = (): void => {
  try {
    const counter = parseInt(localStorage.getItem("sess_data_counter") || "0");
    
    for (let i = 0; i < counter; i++) {
      localStorage.removeItem(`sess_data_#_${i}`);
    }
    
    localStorage.removeItem("sess_data_counter");
  } catch (error) {
    console.error('Error clearing session history:', error);
  }
};

export const getIsoTime = (): string => {
  const now = new Date();
  return now.toLocaleDateString('en-GB') + ' at ' + now.toLocaleTimeString('en-GB', { hour12: false });
};
