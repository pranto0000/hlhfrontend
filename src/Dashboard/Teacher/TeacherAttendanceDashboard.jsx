import React, { useState, useEffect } from "react";
import axios from "axios";
import ReactPaginate from "react-paginate";

const TeacherAttendanceDashboard = () => {
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);

  const PER_PAGE = 10; // Number of students per page

  // Fetch students and attendance records
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const studentRes = await axios.get("https://holy-lab-hospital.onrender.com/api/studentsD");
        setStudents(studentRes.data.students || []);
        const attendanceRes = await axios.get("https://holy-lab-hospital.onrender.com/api/today");
        setAttendanceRecords(attendanceRes.data.attendance || []);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "Failed to fetch data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter students based on search query
  const filteredStudents = students.filter((student) => {
    const name = student.name ? student.name.toLowerCase() : "";
    return (
      name.includes(searchQuery.toLowerCase())
    );
  });

  // Get attendance details for a student
  const getAttendanceDetails = (studentId) => {
    const record = attendanceRecords.find((att) => att.studentId === studentId);
    if (!record) return { status: "Absent", startTime: null, endTime: null };

    return {
      status: "Present",
      startTime: record.presentStartTime
        ? new Date(record.presentStartTime).toLocaleTimeString()
        : "N/A",
      endTime: record.presentEndTime
        ? new Date(record.presentEndTime).toLocaleTimeString()
        : "N/A",
    };
  };

  // Pagination logic
  const offset = currentPage * PER_PAGE;
  const currentPageStudents = filteredStudents.slice(offset, offset + PER_PAGE);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(0); // Reset to the first page on new search
  };

  // Display loading or error
  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Attendance Dashboard</h1>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search Employee..."
        value={searchQuery}
        onChange={handleSearch}
        className="mb-4 px-4 py-2 border rounded w-full"
      />

      {/* Attendance Summary */}
      <div className="summary mb-4">
        <p>Total Employee: {filteredStudents.length}</p>
        <p>
          Present:{" "}
          {attendanceRecords.filter((record) => record.presentStartTime).length}
        </p>
        <p>
          Absent:{" "}
          {filteredStudents.length -
            attendanceRecords.filter((record) => record.presentStartTime).length}
        </p>
      </div>

      {/* Attendance Table */}
      {filteredStudents.length === 0 ? (
        <div>No Employee available for today.</div>
      ) : (
        <div>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2">Name</th>
                <th className="border border-gray-300 px-4 py-2">
                  Attendance Status
                </th>
                <th className="border border-gray-300 px-4 py-2">Start Time</th>
                <th className="border border-gray-300 px-4 py-2">End Time</th>
              </tr>
            </thead>
            <tbody>
              {currentPageStudents.map((student) => {
                const { status, startTime, endTime } = getAttendanceDetails(
                  student._id
                );
                return (
                  <tr key={student._id}>
                    <td className="border border-gray-300 px-4 py-2">
                      {student.name || "N/A"}
                    </td>
                    <td
                      className={`border border-gray-300 px-4 py-2 font-bold ${
                        status === "Present" ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {status}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {startTime || "N/A"}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {endTime || "N/A"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="mt-5">
            {/* Pagination */}
          <ReactPaginate 
            previousLabel={"← Previous"}
            nextLabel={"Next →"}
            pageCount={Math.ceil(filteredStudents.length / PER_PAGE)}
            onPageChange={(e) => setCurrentPage(e.selected)}
            containerClassName={
              "flex justify-center gap-3 items-center font-poppins text-xs"
            }
            activeClassName={
              "bg-transparent border-b-4 border-red-500 text-white rounded-lg font-medium py-2"
            }
            pageLinkClassName={
              "bg-transparent text-gray-800 border border-gray-800 rounded-lg font-medium px-3 py-2"
            }
            previousLinkClassName={
              "bg-rose-400 text-white lg:px-4 px-3 text-xs lg:text-base py-2 rounded-lg font-medium"
            }
            nextLinkClassName={
              "bg-rose-400 text-white lg:px-4 px-3 text-xs lg:text-base py-2 rounded-lg font-medium"
            }
          />
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherAttendanceDashboard;
