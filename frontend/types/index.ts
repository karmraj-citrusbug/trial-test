export interface IFileItem {
  file_id: string;
  filename	: string;
  gdrive_url: string;
  icon_filename: string;
  date_time: string;
  id: string;
}

export interface IProject {
  user: string;
  id: string;
  project: string;
  foldername: string;
  gdrive_url: string;
  date_time: string;
  icon_filename: string;
  logs: ILog[];
  files: IFileItem[];
  folder_id: string;
}

export interface IProjectTableProps {
  data: IProject[];
  currentPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  loading: boolean;
}

export interface ILog {
  timestamp: string;
  status: string;
}