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
}