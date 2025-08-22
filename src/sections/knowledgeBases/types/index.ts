export interface knowledgeBasesType {
  id: number;
  name: string;
  description: string;
  account_id: number;
  created_at: string;
  modified_at: string;
}
export interface ChunkMethodsType {
  name: string;
  value: string;
}
export interface KnowledgeBaseSelectedType {
    id: number;
    name: string;
    description: string;
    account_id: number;
    created_at: string;
    modified_at: string;
    chunk_size: number;
    chunk_overlap: number;
    chunk_method: 'splitter' | string;
    splitters: string[];
    use_ocr: boolean;
    similarity_threshold: number;
    top_n: number;
  }
  