import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Card, Badge } from '../components/common/Card';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle,
  AlertTriangle,
  XCircle,
  FileCheck2,
  RefreshCw,
  Database,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Student, SubjectMark, ValidationError } from '../types';

export const DataImport: React.FC = () => {
  const { importDataset, config, updateSchoolConfig } = useData();

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [detectedSheets, setDetectedSheets] = useState<string[]>([]);
  const [parsedStudents, setParsedStudents] = useState<Student[]>([]);
  const [parsedMarks, setParsedMarks] = useState<SubjectMark[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [duplicateIds, setDuplicateIds] = useState<string[]>([]);
  const [unmatchedMarkIds, setUnmatchedMarkIds] = useState<string[]>([]);
  const [replaceExisting, setReplaceExisting] = useState(false);
  const [mapYearToGrade, setMapYearToGrade] = useState(config.davGradeMappingEnabled);
  const [importCompleted, setImportCompleted] = useState<string | null>(null);

  // Handle file drop/selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = async (fileObj: File) => {
    setFile(fileObj);
    setLoading(true);
    setImportCompleted(null);
    setValidationErrors([]);
    setDuplicateIds([]);
    setUnmatchedMarkIds([]);

    try {
      const buffer = await fileObj.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      setDetectedSheets(workbook.SheetNames);

      // Check for expected sheets
      const hasStudentsSheet = workbook.SheetNames.some((s) => s.toLowerCase() === 'students');
      const hasMarksSheet = workbook.SheetNames.some(
        (s) => s.toLowerCase() === 'subjectmarks' || s.toLowerCase() === 'marks'
      );

      const errors: ValidationError[] = [];

      // 1. Parse Students
      let rawStudents: any[] = [];
      const studentSheetName = workbook.SheetNames.find((s) => s.toLowerCase() === 'students') || workbook.SheetNames[0];
      if (studentSheetName) {
        rawStudents = XLSX.utils.sheet_to_json(workbook.Sheets[studentSheetName]);
      }

      // 2. Parse SubjectMarks
      let rawMarks: any[] = [];
      const marksSheetName = workbook.SheetNames.find(
        (s) => s.toLowerCase() === 'subjectmarks' || s.toLowerCase() === 'marks'
      ) || workbook.SheetNames[1];
      if (marksSheetName) {
        rawMarks = XLSX.utils.sheet_to_json(workbook.Sheets[marksSheetName]);
      }

      // Validate Students
      const validStudents: Student[] = [];
      const seenIds = new Set<string>();
      const duplicates: string[] = [];

      rawStudents.forEach((row, idx) => {
        const rowNum = idx + 2;
        const studentId = row.StudentID || row.student_id || row['Student ID'];

        if (!studentId) {
          errors.push({
            sheet: 'Students',
            row: rowNum,
            field: 'StudentID',
            value: null,
            message: 'Missing mandatory StudentID',
            severity: 'error',
          });
          return;
        }

        const sid = String(studentId).trim();
        if (seenIds.has(sid)) {
          duplicates.push(sid);
          errors.push({
            sheet: 'Students',
            row: rowNum,
            field: 'StudentID',
            value: sid,
            message: `Duplicate StudentID found: ${sid}`,
            severity: 'error',
          });
          return;
        }
        seenIds.add(sid);

        const att = Number(row.AttendancePct ?? row.attendance_pct ?? row['Attendance %'] ?? 0);
        if (isNaN(att) || att < 0 || att > 100) {
          errors.push({
            sheet: 'Students',
            row: rowNum,
            field: 'AttendancePct',
            value: att,
            message: 'Attendance percentage must be a number between 0 and 100',
            severity: 'error',
          });
        }

        const assign = Number(row.AssignmentCompletionPct ?? row['AssignmentCompletionPct'] ?? 0);
        if (isNaN(assign) || assign < 0 || assign > 100) {
          errors.push({
            sheet: 'Students',
            row: rowNum,
            field: 'AssignmentCompletionPct',
            value: assign,
            message: 'Assignment completion percentage must be between 0 and 100',
            severity: 'warning',
          });
        }

        validStudents.push({
          StudentID: sid,
          StudentName: row.StudentName || `Student ${sid}`,
          Department: row.Department || 'General',
          Year: row.Year || '1st Year',
          Section: row.Section || 'A',
          Gender: row.Gender || 'Unspecified',
          StudyHoursPerWeek: Number(row.StudyHoursPerWeek || 5),
          AttendancePct: att,
          AssignmentCompletionPct: assign,
          ExtracurricularHoursPerWeek: Number(row.ExtracurricularHoursPerWeek || 0),
          AttendanceBand: row.AttendanceBand || (att >= 85 ? '85-100%' : att >= 75 ? '75-85%' : att >= 60 ? '60-75%' : 'Below 60%'),
        });
      });

      // Validate SubjectMarks
      const validMarks: SubjectMark[] = [];
      const unmatched: string[] = [];

      rawMarks.forEach((row, idx) => {
        const rowNum = idx + 2;
        const studentId = String(row.StudentID || row.student_id || '').trim();

        if (!studentId) {
          errors.push({
            sheet: 'SubjectMarks',
            row: rowNum,
            field: 'StudentID',
            value: null,
            message: 'Missing StudentID in marks record',
            severity: 'error',
          });
          return;
        }

        // Relational check: must exist in students
        if (!seenIds.has(studentId)) {
          unmatched.push(studentId);
          errors.push({
            sheet: 'SubjectMarks',
            row: rowNum,
            field: 'StudentID',
            value: studentId,
            message: `Unmatched StudentID: ${studentId} does not exist in Students table`,
            severity: 'warning',
          });
        }

        const marks = Number(row.Marks ?? 0);
        const maxMarks = Number(row.MaxMarks ?? 100);

        if (isNaN(marks) || marks < 0 || marks > maxMarks) {
          errors.push({
            sheet: 'SubjectMarks',
            row: rowNum,
            field: 'Marks',
            value: marks,
            message: `Marks (${marks}) exceeds max marks (${maxMarks}) or is negative`,
            severity: 'error',
          });
        }

        validMarks.push({
          StudentID: studentId,
          Subject: row.Subject || 'General Assessment',
          Marks: marks,
          MaxMarks: maxMarks,
          ExamType: row.ExamType || 'Midterm',
          AcademicTerm: row.AcademicTerm || '2026-27 Sem 1',
          Result: row.Result || (marks >= config.passMarksCutoff ? 'Pass' : 'Fail'),
        });
      });

      setParsedStudents(validStudents);
      setParsedMarks(validMarks);
      setValidationErrors(errors);
      setDuplicateIds(Array.from(new Set(duplicates)));
      setUnmatchedMarkIds(Array.from(new Set(unmatched)));
    } catch (err: any) {
      alert('Error parsing Excel workbook: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmImport = () => {
    if (parsedStudents.length === 0) {
      alert('No valid student records found to import.');
      return;
    }

    // Apply DAV grade mapping preference if toggled
    if (mapYearToGrade !== config.davGradeMappingEnabled) {
      updateSchoolConfig({ davGradeMappingEnabled: mapYearToGrade });
    }

    const summaryText = `Imported ${parsedStudents.length} students & ${parsedMarks.length} subject marks from ${
      file?.name || 'workbook'
    }. (Replace mode: ${replaceExisting ? 'Yes' : 'No'})`;

    importDataset(parsedStudents, parsedMarks, replaceExisting, summaryText);
    setImportCompleted(summaryText);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight font-serif">
          Excel Data Import & Relational Validation
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Ingest institutional Excel or CSV datasets, map columns with DAV adaptations, and validate relational integrity
        </p>
      </div>

      {/* Completion Banner */}
      {importCompleted && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm">Import Completed Successfully!</h4>
            <p className="text-xs text-emerald-800 mt-0.5">{importCompleted}</p>
            <p className="text-[11px] text-emerald-700 mt-1">
              All dashboard KPIs, class comparisons, and subject distributions have been refreshed with the new dataset.
            </p>
          </div>
        </div>
      )}

      {/* Import Workflow Card */}
      <Card title="Upload Excel Workbook (.xlsx / .csv)" subtitle="Expected sheets: Students, SubjectMarks">
        <div className="space-y-4">
          {/* Dropzone */}
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-orange-500 transition-colors bg-slate-50/50">
            <UploadCloud className="w-10 h-10 text-orange-600 mx-auto mb-3" />
            <p className="text-xs font-semibold text-slate-800">
              Drag and drop your Excel workbook here, or click to browse
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Supports .xlsx, .xls, and .csv files up to 25MB
            </p>

            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="hidden"
              id="excel-file-upload"
            />
            <label
              htmlFor="excel-file-upload"
              className="inline-block mt-4 px-4 py-2 bg-blue-950 hover:bg-blue-900 text-white text-xs font-semibold rounded-lg cursor-pointer shadow-xs transition-colors"
            >
              Select File From Computer
            </label>
          </div>

          {/* Quick Demo File Action */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-orange-50 border border-orange-200 text-xs text-orange-950">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-orange-700" />
              <span>
                <strong>Supplied Dataset Available:</strong> <code>Student_Performance_Analytics_Data.xlsx</code> (500 students, 2,500 marks).
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Validation & Preview Section (When File Uploaded) */}
      {file && (
        <div className="space-y-6 animate-in fade-in">
          {/* Sheet Detection & Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Detected Sheets</span>
              <div className="font-bold text-slate-900 text-sm mt-1">
                {detectedSheets.join(', ') || 'None'}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">{detectedSheets.length} workbook worksheets</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Valid Student Records</span>
              <div className="font-bold text-blue-950 text-sm mt-1">{parsedStudents.length} rows</div>
              <p className="text-[11px] text-slate-400 mt-0.5">Students sheet</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Valid Marks Records</span>
              <div className="font-bold text-emerald-700 text-sm mt-1">{parsedMarks.length} assessments</div>
              <p className="text-[11px] text-slate-400 mt-0.5">SubjectMarks sheet</p>
            </div>
          </div>

          {/* DAV School Adaptation Layer Settings */}
          <Card
            title="DAV School Data Adaptation Options"
            subtitle="Configure schema interpretation prior to importing into the database"
          >
            <div className="space-y-3 text-xs text-slate-700">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="davGradeMap"
                  checked={mapYearToGrade}
                  onChange={(e) => setMapYearToGrade(e.target.checked)}
                  className="mt-0.5 rounded text-orange-600 focus:ring-orange-500"
                />
                <label htmlFor="davGradeMap" className="cursor-pointer">
                  <strong>Enable DAV Grade Adaptation:</strong> Map collegiate <code>1st Year</code>, <code>2nd Year</code>, <code>3rd Year</code>, <code>4th Year</code> to DAV School <code>Class 9</code>, <code>Class 10</code>, <code>Class 11</code>, and <code>Class 12</code>.
                </label>
              </div>

              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="replaceData"
                  checked={replaceExisting}
                  onChange={(e) => setReplaceExisting(e.target.checked)}
                  className="mt-0.5 rounded text-orange-600 focus:ring-orange-500"
                />
                <label htmlFor="replaceData" className="cursor-pointer">
                  <strong>Replace Existing Database:</strong> Completely overwrite current records rather than merging/upserting new students.
                </label>
              </div>
            </div>
          </Card>

          {/* Validation Errors & Relational Checks */}
          {validationErrors.length > 0 && (
            <Card
              title={`Validation Diagnostics (${validationErrors.length} notices)`}
              subtitle="Validation rules check required columns, numeric ranges, duplicate keys, and unmatched StudentIDs"
            >
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1 text-xs">
                {validationErrors.slice(0, 20).map((err, i) => (
                  <div
                    key={i}
                    className={`p-2.5 rounded-lg border flex items-start gap-2.5 ${
                      err.severity === 'error'
                        ? 'bg-rose-50 border-rose-200 text-rose-900'
                        : 'bg-amber-50 border-amber-200 text-amber-900'
                    }`}
                  >
                    {err.severity === 'error' ? (
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span className="font-bold">
                        [{err.sheet} Row {err.row}] {err.field}:
                      </span>{' '}
                      {err.message}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Action Footer */}
          <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200">
            <div className="text-xs text-slate-500">
              Ready to commit: <strong>{parsedStudents.length}</strong> students and <strong>{parsedMarks.length}</strong> marks.
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setFile(null);
                  setParsedStudents([]);
                  setParsedMarks([]);
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmImport}
                className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-lg shadow-md transition-colors flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" /> Confirm & Import Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
