from flask import Flask, jsonify, request, g
from mysql.connector import pooling, Error
from flask_cors import CORS

DB_HOST = "extracteddata.cjqiw8qaa6po.us-east-1.rds.amazonaws.com"
DB_USER = "admin"
DB_NAME = "extractedData"
DB_PASSWORD = "mYx$E|V!cgRE35!~JEQ>AtwIu!uG"

app = Flask(__name__)

# Enable CORS for all routes, you can restrict it by providing specific origins
CORS(app)

# Create a connection pool
connection_pool = pooling.MySQLConnectionPool(
    pool_name="mypool",
    pool_size=5,
    pool_reset_session=True,
    host=DB_HOST,
    user=DB_USER,
    database=DB_NAME,
    password=DB_PASSWORD,
)


# Get a database connection from the pool
def get_db_connection():
    """Get a database connection from the pool."""
    try:
        if "db_connection" not in g:
            g.db_connection = connection_pool.get_connection()
        return g.db_connection
    except Error as e:
        print(f"Error getting connection from pool: {e}")
        return None


# Close the connection when the app context is destroyed
@app.teardown_appcontext
def close_db_connection(exception=None):
    """Close the database connection."""
    db_connection = g.pop("db_connection", None)
    if db_connection:
        db_connection.close()


def execute_query(connection, query, params=None):
    """
    Execute a query and return the results
    """
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute(query, params or ())
        return cursor.fetchall()
    except Error as e:
        print(f"Error executing query: {e}")
        return None
    finally:
        cursor.close()


def execute_count_query(connection, query, params=None):
    """
    Execute a count query and return the count result
    """
    try:
        cursor = connection.cursor()
        cursor.execute(query, params or ())
        return cursor.fetchone()[0]
    except Error as e:
        print(f"Error executing count query: {e}")
        return None
    finally:
        cursor.close()


def format_datetime(data, datetime_key="datetime"):
    """
    Format datetime to a more readable format
    """
    if datetime_key in data:
        data["date_time"] = data[datetime_key].strftime("%m/%d/%Y, %I:%M %p")
        del data[datetime_key]
    data["logs"] = [
        {
            "timestamp": "12/29/2024, 4:00:05 PM",
            "status": "Adding folder name of Project_Documents_14589-xuT8g3-12-29-2024-160005",
        },
        {
            "timestamp": "12/29/2024, 4:10:12 PM",
            "status": "Uploading file project_plan.pdf",
        },
        {
            "timestamp": "12/29/2024, 4:30:30 PM",
            "status": "Uploading file requirements.docx",
        },
        {
            "timestamp": "12/29/2024, 4:45:00 PM",
            "status": "PDFs uploaded to S3",
        },
        {
            "timestamp": "12/29/2024, 5:00:00 PM",
            "status": "Image Analyzer handler started.",
        },
    ]
    return data


@app.route("/get-folder-file-data", methods=["GET"])
def get_folder_file_data():
    """
    Retrieve folder and file data from the database
    """

    connection = get_db_connection()
    if connection is None:
        return jsonify({"statusCode": 500, "message": "Database connection error"}), 500

    try:
        # Pagination parameters
        page = request.args.get("page", 1, type=int)
        limit = request.args.get("limit", 10, type=int)
        offset = (page - 1) * limit

        # Query to get the total count of folders
        count_query = "SELECT COUNT(*) FROM gdrive_folders WHERE user = %s"
        total_folders = execute_count_query(connection, count_query, params=("devuser",))

        # Combined query to fetch folders and their corresponding files
        combined_query = """
        SELECT 
            f.id AS folder_id, f.datetime AS folder_datetime, f.foldername, f.gdrive_url AS folder_gdrive_url, 
            f.folder_id AS folder_folder_id, f.user AS folder_user, f.folderpath, f.project AS folder_project, 
            f.icon_filename AS folder_icon_filename, 
            s.id AS file_id, s.datetime AS file_datetime, s.filename, s.gdrive_url AS file_gdrive_url, 
            s.file_id AS file_file_id, s.user AS file_user, s.folder AS file_folder, 
            s.project AS file_project, s.icon_filename AS file_icon_filename
        FROM gdrive_folders f
        LEFT JOIN gdrive_status s ON s.folder LIKE CONCAT('%', f.folderpath, '%') 
        WHERE f.user = %s
        ORDER BY f.foldername, s.filename
        """
        # LIMIT %s OFFSET %s;

        result = execute_query(connection, combined_query, params=("devuser", limit, offset))
        if result is None:
            raise Exception("Failed to fetch folder and file data")

        response_data = {}
        # Group the files by their folders
        for row in result:
            folder_id = row["folder_id"]

            if folder_id not in response_data:
                folder_data = {
                    "id": row["folder_id"],
                    "datetime": row["folder_datetime"],
                    "foldername": row["foldername"],
                    "gdrive_url": row["folder_gdrive_url"],
                    "folder_id": row["folder_folder_id"],
                    "user": row["folder_user"],
                    "folderpath": row["folderpath"],
                    "project": row["folder_project"],
                    "icon_filename": row["folder_icon_filename"],
                    "files": [],
                }
                # Format folder datetime
                folder_data = format_datetime(folder_data, datetime_key="datetime")
                response_data[folder_id] = folder_data

            # Add the file data if it exists
            if row["file_id"]:
                file_data = {
                    "id": row["file_id"],
                    "datetime": row["file_datetime"],
                    "filename": row["filename"],
                    "gdrive_url": row["file_gdrive_url"],
                    "file_id": row["file_file_id"],
                    "user": row["file_user"],
                    "folder": row["file_folder"],
                    "project": row["file_project"],
                    "icon_filename": row["file_icon_filename"],
                }
                # Format file datetime
                file_data = format_datetime(file_data, datetime_key="datetime")
                response_data[folder_id]["files"].append(file_data)

        # Convert the response_data dictionary to a list of folders
        response_data = list(response_data.values())

        return jsonify(
            {
                "statusCode": 200,
                "message": "Folder and file data retrieved successfully",
                "data": response_data,
                "pagination": {
                    "total": total_folders,
                    "page": page,
                    "limit": limit,
                    "totalPages": (total_folders + limit - 1) // limit,  # Calculates total pages
                },
            }
        )
    except Exception as e:
        return jsonify({"statusCode": 500, "message": f"Error: {str(e)}"}), 500
    finally:
        # The connection will be closed automatically when the app context ends
        pass


if __name__ == "__main__":
    app.run(debug=True)
