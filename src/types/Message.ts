/*export interface Message {
    type: 'text' | 'image';
    content: string;
    saved?: boolean;
  }
*/

export interface Message {
  chatroomId: number;
  type: 'text' | 'image';
  input: string;
  output: string;
  description?: string;
}

export interface DesignMessage {
  chatroomId: number;
  type: 'text' | 'image';
  input: string;
  output: string | { imageSrc: string; description: string };
}