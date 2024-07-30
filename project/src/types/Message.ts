/*export interface Message {
    type: 'text' | 'image';
    content: string;
    saved?: boolean;
  }
*/

export interface Message {
  chatroomId: string;
  type: 'text' | 'image';
  input: string;
  output: string;
}