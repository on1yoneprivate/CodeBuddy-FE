export interface DesignMessage {
  chatroomId: string;
  type: 'text' | 'image';
  input: string;
  output: string | JSX.Element;
}
  