import {
  ClassStream,
  ExamPeriod,
  MarkValue,
  SchoolConfig,
  Student,
  Subject,
  TeacherProfile,
  TermConfig,
  WhatsAppMessage,
} from '../types';

export const INITIAL_SCHOOL_CONFIG: SchoolConfig = {
  schoolName: 'Kabarak Demo Secondary School',
  motto: 'Excellence in Truth and Knowledge',
  postalAddress: 'P.O. Box 1234 - 20100, Nakuru',
  contactPhoneEmail: '+254 700 000000 · info@kabarakdemo.ac.ke',
  academicYear: '2026',
  term: 'Term 2',
  termOpeningDate: '2026-05-05',
  termClosingDate: '2026-08-08',
  calculationMethod: 'best7',
  classTeacher: 'Mr. J. Kiprotich',
  principalName: 'Dr. E. Kibet (PhD)',
};

export const INITIAL_STREAMS: ClassStream[] = [
  { id: 'str-1', name: 'Form 4 East', form: 'Form 4', stream: 'East', classTeacher: 'Mr. J. Kiprotich' },
  { id: 'str-2', name: 'Form 4 West', form: 'Form 4', stream: 'West', classTeacher: 'Mrs. S. Chelangat' },
  { id: 'str-3', name: 'Form 4 North', form: 'Form 4', stream: 'North', classTeacher: 'Mr. P. Wanyama' },
  { id: 'str-4', name: 'Form 3 East', form: 'Form 3', stream: 'East', classTeacher: 'Ms. A. Muthoni' },
];

export const INITIAL_EXAMS: ExamPeriod[] = [
  { id: 'exam-1', name: 'End-term Exam, Term 2 2026', term: 'Term 2', year: 2026, type: 'End-term' },
  { id: 'exam-2', name: 'Mid-term Exam, Term 2 2026', term: 'Term 2', year: 2026, type: 'Mid-term' },
  { id: 'exam-3', name: 'End-term Exam, Term 1 2026', term: 'Term 1', year: 2026, type: 'End-term' },
];

export const INITIAL_TERMS: TermConfig[] = [
  { id: 'term-1', name: 'Term 1 2026', year: 2026, startDate: '2026-01-08', endDate: '2026-04-05' },
  { id: 'term-2', name: 'Term 2 2026', year: 2026, startDate: '2026-05-05', endDate: '2026-08-08' },
  { id: 'term-3', name: 'Term 3 2026', year: 2026, startDate: '2026-08-25', endDate: '2026-11-20' },
];

export const INITIAL_SUBJECTS: Subject[] = [
  { id: 'sub-mat', code: 'MAT', name: 'Mathematics', department: 'Mathematics', entered: 42, lastExamMean: 54.7, teacher: 'Mr. J. Kiprotich' },
  { id: 'sub-eng', code: 'ENG', name: 'English', department: 'Languages', entered: 42, lastExamMean: 55.8, teacher: 'Mrs. H. Otieno' },
  { id: 'sub-kis', code: 'KIS', name: 'Kiswahili', department: 'Languages', entered: 42, lastExamMean: 64.0, teacher: 'Mr. B. Mwangi' },
  { id: 'sub-bio', code: 'BIO', name: 'Biology', department: 'Sciences', entered: 42, lastExamMean: 58.2, teacher: 'Dr. C. Wambua' },
  { id: 'sub-che', code: 'CHE', name: 'Chemistry', department: 'Sciences', entered: 42, lastExamMean: 45.3, teacher: 'Mr. T. Koech' },
  { id: 'sub-phy', code: 'PHY', name: 'Physics', department: 'Sciences', entered: 42, lastExamMean: 49.5, teacher: 'Ms. F. Ndinda' },
  { id: 'sub-his', code: 'HIS', name: 'History & Govt', department: 'Humanities', entered: 42, lastExamMean: 62.9, teacher: 'Mr. K. Omondi' },
  { id: 'sub-geo', code: 'GEO', name: 'Geography', department: 'Humanities', entered: 42, lastExamMean: 52.3, teacher: 'Mrs. R. Chebet' },
  { id: 'sub-cre', code: 'CRE', name: 'CRE', department: 'Humanities', entered: 42, lastExamMean: 63.9, teacher: 'Pastor J. Kariuki' },
  { id: 'sub-bst', code: 'BST', name: 'Business Studies', department: 'Applied Sciences', entered: 42, lastExamMean: 56.6, teacher: 'Mr. L. Mutiso' },
];

export const INITIAL_STUDENTS: Student[] = [
  { id: 's-1', admNo: '3842', name: 'Grace Achieng', stream: 'Form 4 East', gender: 'Female', kcpeMarks: 382, status: 'Active' },
  { id: 's-2', admNo: '3819', name: 'Daniel Kiprop', stream: 'Form 4 East', gender: 'Male', kcpeMarks: 374, status: 'Active' },
  { id: 's-3', admNo: '3855', name: 'Mercy Njeri', stream: 'Form 4 East', gender: 'Female', kcpeMarks: 368, status: 'Active' },
  { id: 's-4', admNo: '3804', name: 'Samuel Kamau', stream: 'Form 4 East', gender: 'Male', kcpeMarks: 355, status: 'Active' },
  { id: 's-5', admNo: '3890', name: 'Linet Chebet', stream: 'Form 4 East', gender: 'Female', kcpeMarks: 362, status: 'Active' },
  { id: 's-6', admNo: '3821', name: 'Brian Omondi', stream: 'Form 4 East', gender: 'Male', kcpeMarks: 379, status: 'Active' },
  { id: 's-7', admNo: '3873', name: 'Esther Wanjiku', stream: 'Form 4 East', gender: 'Female', kcpeMarks: 348, status: 'Active' },
  { id: 's-8', admNo: '3861', name: 'Collins Mutua', stream: 'Form 4 East', gender: 'Male', kcpeMarks: 341, status: 'Active' },
  { id: 's-9', admNo: '3838', name: 'Fatuma Hassan', stream: 'Form 4 East', gender: 'Female', kcpeMarks: 339, status: 'Active' },
  { id: 's-10', admNo: '3812', name: 'Kevin Otieno', stream: 'Form 4 East', gender: 'Male', kcpeMarks: 330, status: 'Active' },
  { id: 's-11', admNo: '3866', name: 'Joy Mwangi', stream: 'Form 4 East', gender: 'Female', kcpeMarks: 326, status: 'Active' },
  { id: 's-12', admNo: '3849', name: 'Dennis Barasa', stream: 'Form 4 East', gender: 'Male', kcpeMarks: 320, status: 'Active' },
  { id: 's-13', admNo: '3884', name: 'Faith Cherono', stream: 'Form 4 East', gender: 'Female', kcpeMarks: 315, status: 'Active' },
  { id: 's-14', admNo: '3809', name: 'Paul Kariuki', stream: 'Form 4 East', gender: 'Male', kcpeMarks: 312, status: 'Active' },
  { id: 's-15', admNo: '4087', name: 'Faith Wanjiru', stream: 'Form 4 East', gender: 'Female', kcpeMarks: 335, status: 'Active' },
  { id: 's-16', admNo: '4088', name: 'Brian Otieno', stream: 'Form 4 East', gender: 'Male', kcpeMarks: 340, status: 'Active' },
  { id: 's-17', admNo: '4089', name: 'Amina Hassan', stream: 'Form 4 East', gender: 'Female', kcpeMarks: 328, status: 'Active' },
  { id: 's-18', admNo: '4090', name: 'Kevin Mutua', stream: 'Form 4 East', gender: 'Male', kcpeMarks: 322, status: 'Active' },
  { id: 's-19', admNo: '4091', name: 'Dennis Omondi', stream: 'Form 4 East', gender: 'Male', kcpeMarks: 350, status: 'Active' },
  { id: 's-20', admNo: '3825', name: 'Victor Kiptoo', stream: 'Form 4 East', gender: 'Male', kcpeMarks: 310, status: 'Active' },
  { id: 's-21', admNo: '3830', name: 'Brenda Awuor', stream: 'Form 4 East', gender: 'Female', kcpeMarks: 345, status: 'Active' },
  { id: 's-22', admNo: '3834', name: 'Sharon Chepkemoi', stream: 'Form 4 East', gender: 'Female', kcpeMarks: 338, status: 'Active' },
  { id: 's-23', admNo: '3840', name: 'Geoffrey Maina', stream: 'Form 4 East', gender: 'Male', kcpeMarks: 305, status: 'Active' },
  { id: 's-24', admNo: '3845', name: 'Wycliffe Ochieng', stream: 'Form 4 East', gender: 'Male', kcpeMarks: 332, status: 'Active' },
  { id: 's-25', admNo: '3850', name: 'Priscilla Muthoni', stream: 'Form 4 East', gender: 'Female', kcpeMarks: 329, status: 'Active' },
  { id: 's-26', admNo: '3852', name: 'Titus Kiprotich', stream: 'Form 4 East', gender: 'Male', kcpeMarks: 314, status: 'Active' },
  { id: 's-27', admNo: '3858', name: 'Eunice Nyambura', stream: 'Form 4 East', gender: 'Female', kcpeMarks: 342, status: 'Active' },
  { id: 's-28', admNo: '3864', name: 'Alex Wekesa', stream: 'Form 4 East', gender: 'Male', kcpeMarks: 298, status: 'Active' },
  { id: 's-29', admNo: '3870', name: 'Cynthia Jepkosgei', stream: 'Form 4 East', gender: 'Female', kcpeMarks: 334, status: 'Active' },
  { id: 's-30', admNo: '3875', name: 'Moses Mwiti', stream: 'Form 4 East', gender: 'Male', kcpeMarks: 318, status: 'Active' },
  { id: 's-31', admNo: '3879', name: 'Gladys Akinyi', stream: 'Form 4 East', gender: 'Female', kcpeMarks: 302, status: 'Active' },
  { id: 's-32', admNo: '3882', name: 'Ronald Koech', stream: 'Form 4 East', gender: 'Male', kcpeMarks: 295, status: 'Active' },
  { id: 's-33', admNo: '3887', name: 'Beatrice Wangari', stream: 'Form 4 East', gender: 'Female', kcpeMarks: 325, status: 'Active' },
  { id: 's-34', admNo: '3893', name: 'Hillary Rotich', stream: 'Form 4 East', gender: 'Male', kcpeMarks: 308, status: 'Active' },
  { id: 's-35', admNo: '3896', name: 'Janet Moraa', stream: 'Form 4 East', gender: 'Female', kcpeMarks: 290, status: 'Active' },
  { id: 's-36', admNo: '3899', name: 'Simon Mburu', stream: 'Form 4 East', gender: 'Male', kcpeMarks: 285, status: 'Active' },
  { id: 's-37', admNo: '3903', name: 'Dorothy Anyango', stream: 'Form 4 East', gender: 'Female', kcpeMarks: 311, status: 'Active' },
  { id: 's-38', admNo: '3908', name: 'Kelvin Kibet', stream: 'Form 4 East', gender: 'Male', kcpeMarks: 280, status: 'Active' },
  { id: 's-39', admNo: '3912', name: 'Lucy Wanjira', stream: 'Form 4 East', gender: 'Female', kcpeMarks: 275, status: 'Active' },
  { id: 's-40', admNo: '3915', name: 'Oscar Korir', stream: 'Form 4 East', gender: 'Male', kcpeMarks: 268, status: 'Active' },
  { id: 's-41', admNo: '3920', name: 'Rose Nduta', stream: 'Form 4 East', gender: 'Female', kcpeMarks: 260, status: 'Active' },
  { id: 's-42', admNo: '3924', name: 'Edwin Juma', stream: 'Form 4 East', gender: 'Male', kcpeMarks: 252, status: 'Active' },
  // Form 4 West sample students
  { id: 'sw-1', admNo: '3951', name: 'Alice Mutheu', stream: 'Form 4 West', gender: 'Female', kcpeMarks: 360, status: 'Active' },
  { id: 'sw-2', admNo: '3952', name: 'Kiprono Cheruiyot', stream: 'Form 4 West', gender: 'Male', kcpeMarks: 345, status: 'Active' },
  { id: 'sw-3', admNo: '3953', name: 'Vivian Cherono', stream: 'Form 4 West', gender: 'Female', kcpeMarks: 338, status: 'Active' },
  { id: 'sw-4', admNo: '3954', name: 'Peter Karanja', stream: 'Form 4 West', gender: 'Male', kcpeMarks: 325, status: 'Active' },
];

export const INITIAL_MARKS: Record<string, Record<string, MarkValue>> = {
  // s-1: Grace Achieng (Rank 1, A-)
  's-1': { MAT: 82, ENG: 78, KIS: 85, BIO: 74, CHE: 70, PHY: 72, HIS: 80, GEO: 76, CRE: 88, BST: 71 },
  // s-2: Daniel Kiprop (Rank 2, B+)
  's-2': { MAT: 89, ENG: 66, KIS: 68, BIO: 79, CHE: 75, PHY: 81, HIS: 65, GEO: 71, CRE: 77, BST: 84 },
  // s-3: Mercy Njeri (Rank 3, B+)
  's-3': { MAT: 68, ENG: 74, KIS: 70, BIO: 62, CHE: 68, PHY: 58, HIS: 76, GEO: 69, CRE: 80, BST: 64 },
  // s-4: Samuel Kamau (Rank 4, B)
  's-4': { MAT: 52, ENG: 58, KIS: 61, BIO: 46, CHE: 29, PHY: 38, HIS: 63, GEO: 54, CRE: 67, BST: 50 },
  // s-5: Linet Chebet (Rank 5, B)
  's-5': { MAT: 78, ENG: 81, KIS: 80, BIO: 73, CHE: 69, PHY: 66, HIS: 84, GEO: 78, CRE: 82, BST: 75 },
  // s-6: Brian Omondi (Rank 6, B-)
  's-6': { MAT: 92, ENG: 64, KIS: 66, BIO: 85, CHE: 88, PHY: 83, HIS: 60, GEO: 72, CRE: 78, BST: 79 },
  // s-7: Esther Wanjiku (Rank 7, B-)
  's-7': { MAT: 65, ENG: 68, KIS: 72, BIO: 60, CHE: 55, PHY: 58, HIS: 70, GEO: 64, CRE: 75, BST: 63 },
  // s-8: Collins Mutua (Rank 8, C+)
  's-8': { MAT: 62, ENG: 60, KIS: 64, BIO: 58, CHE: 54, PHY: 55, HIS: 66, GEO: 62, CRE: 72, BST: 60 },
  // s-9: Fatuma Hassan (Rank 9, C+)
  's-9': { MAT: 60, ENG: 62, KIS: 65, BIO: 56, CHE: 50, PHY: 52, HIS: 68, GEO: 58, CRE: 70, BST: 58 },
  // s-10: Kevin Otieno (Rank 10, C)
  's-10': { MAT: 58, ENG: 55, KIS: 60, BIO: 52, CHE: 48, PHY: 46, HIS: 62, GEO: 56, CRE: 66, BST: 54 },
  // s-11: Joy Mwangi (Rank 11, C)
  's-11': { MAT: 56, ENG: 54, KIS: 58, BIO: 50, CHE: 45, PHY: 44, HIS: 60, GEO: 55, CRE: 64, BST: 52 },
  // s-12: Dennis Barasa (Rank 12, C-)
  's-12': { MAT: 54, ENG: 52, KIS: 55, BIO: 48, CHE: 42, PHY: 40, HIS: 58, GEO: 52, CRE: 60, BST: 48 },
  // s-13: Faith Cherono (Rank 13, C-)
  's-13': { MAT: 53, ENG: 50, KIS: 54, BIO: 47, CHE: 40, PHY: 38, HIS: 57, GEO: 50, CRE: 58, BST: 47 },
  // s-14: Paul Kariuki (Rank 14, D+)
  's-14': { MAT: 51, ENG: 48, KIS: 52, BIO: 45, CHE: 38, PHY: 36, HIS: 55, GEO: 48, CRE: 56, BST: 45 },
  // s-15: Faith Wanjiru (Near the Line: mean points 6.4, agg 45/84, weakest PHY 41)
  's-15': { MAT: 61, ENG: 73, KIS: 69, BIO: 'ABS', CHE: 55, PHY: 41, HIS: 70, GEO: 64, CRE: 74, BST: 66 },
  // s-16: Brian Otieno (Near the Line: mean points 6.3, agg 44/84, weakest CHE 38)
  's-16': { MAT: 59, ENG: 65, KIS: 62, BIO: 58, CHE: 38, PHY: 52, HIS: 64, GEO: 58, CRE: 68, BST: 60 },
  // s-17: Amina Hassan (Near the Line: mean points 6.1, agg 43/84, weakest MAT 39)
  's-17': { MAT: 39, ENG: 68, KIS: 65, BIO: 54, CHE: 46, PHY: 48, HIS: 66, GEO: 59, CRE: 71, BST: 61 },
  // s-18: Kevin Mutua (Near the Line: mean points 6.0, agg 42/84, weakest BIO 36)
  's-18': { MAT: 58, ENG: 63, KIS: 60, BIO: 36, CHE: 49, PHY: 41, HIS: 66, GEO: 59, CRE: 71, BST: 62 },
  // s-19: Dennis Omondi (Solid)
  's-19': { MAT: 85, ENG: 68, KIS: 75, BIO: 71, CHE: 76, PHY: 77, HIS: 69, GEO: 70, CRE: 81, BST: 78 },
  // s-20: Victor Kiptoo
  's-20': { MAT: 50, ENG: 48, KIS: 52, BIO: 46, CHE: 39, PHY: 37, HIS: 56, GEO: 48, CRE: 58, BST: 46 },
  // s-21: Brenda Awuor
  's-21': { MAT: 68, ENG: 72, KIS: 74, BIO: 64, CHE: 58, PHY: 60, HIS: 74, GEO: 66, CRE: 78, BST: 68 },
  // s-22: Sharon Chepkemoi
  's-22': { MAT: 64, ENG: 67, KIS: 70, BIO: 60, CHE: 52, PHY: 54, HIS: 71, GEO: 63, CRE: 76, BST: 65 },
  // s-23: Geoffrey Maina
  's-23': { MAT: 48, ENG: 46, KIS: 50, BIO: 44, CHE: 35, PHY: 33, HIS: 52, GEO: 45, CRE: 54, BST: 42 },
  // s-24: Wycliffe Ochieng
  's-24': { MAT: 60, ENG: 64, KIS: 66, BIO: 56, CHE: 48, PHY: 50, HIS: 67, GEO: 59, CRE: 72, BST: 61 },
  // s-25: Priscilla Muthoni
  's-25': { MAT: 59, ENG: 63, KIS: 65, BIO: 55, CHE: 47, PHY: 49, HIS: 65, GEO: 58, CRE: 70, BST: 60 },
  // s-26: Titus Kiprotich
  's-26': { MAT: 52, ENG: 50, KIS: 54, BIO: 48, CHE: 41, PHY: 39, HIS: 58, GEO: 50, CRE: 60, BST: 48 },
  // s-27: Eunice Nyambura
  's-27': { MAT: 66, ENG: 70, KIS: 73, BIO: 62, CHE: 56, PHY: 58, HIS: 72, GEO: 65, CRE: 76, BST: 67 },
  // s-28: Alex Wekesa
  's-28': { MAT: 45, ENG: 44, KIS: 48, BIO: 42, CHE: 32, PHY: 30, HIS: 50, GEO: 42, CRE: 52, BST: 40 },
  // s-29: Cynthia Jepkosgei
  's-29': { MAT: 62, ENG: 66, KIS: 68, BIO: 58, CHE: 50, PHY: 52, HIS: 69, GEO: 61, CRE: 74, BST: 63 },
  // s-30: Moses Mwiti
  's-30': { MAT: 54, ENG: 52, KIS: 56, BIO: 50, CHE: 43, PHY: 41, HIS: 60, GEO: 52, CRE: 62, BST: 50 },
  // s-31: Gladys Akinyi
  's-31': { MAT: 46, ENG: 45, KIS: 49, BIO: 43, CHE: 33, PHY: 31, HIS: 51, GEO: 43, CRE: 53, BST: 41 },
  // s-32: Ronald Koech
  's-32': { MAT: 44, ENG: 42, KIS: 47, BIO: 40, CHE: 30, PHY: 28, HIS: 49, GEO: 41, CRE: 51, BST: 39 },
  // s-33: Beatrice Wangari
  's-33': { MAT: 57, ENG: 61, KIS: 63, BIO: 53, CHE: 45, PHY: 47, HIS: 63, GEO: 56, CRE: 68, BST: 58 },
  // s-34: Hillary Rotich
  's-34': { MAT: 49, ENG: 47, KIS: 51, BIO: 45, CHE: 37, PHY: 35, HIS: 54, GEO: 46, CRE: 56, BST: 44 },
  // s-35: Janet Moraa
  's-35': { MAT: 42, ENG: 40, KIS: 45, BIO: 38, CHE: 28, PHY: 26, HIS: 47, GEO: 39, CRE: 49, BST: 37 },
  // s-36: Simon Mburu
  's-36': { MAT: 40, ENG: 38, KIS: 43, BIO: 36, CHE: 26, PHY: 24, HIS: 45, GEO: 37, CRE: 47, BST: 35 },
  // s-37: Dorothy Anyango
  's-37': { MAT: 51, ENG: 49, KIS: 53, BIO: 47, CHE: 39, PHY: 37, HIS: 56, GEO: 48, CRE: 58, BST: 46 },
  // s-38: Kelvin Kibet
  's-38': { MAT: 38, ENG: 36, KIS: 41, BIO: 34, CHE: 24, PHY: 22, HIS: 43, GEO: 35, CRE: 45, BST: 33 },
  // s-39: Lucy Wanjira
  's-39': { MAT: 36, ENG: 34, KIS: 39, BIO: 32, CHE: 22, PHY: 20, HIS: 41, GEO: 33, CRE: 43, BST: 31 },
  // s-40: Oscar Korir
  's-40': { MAT: 34, ENG: 32, KIS: 37, BIO: 30, CHE: 20, PHY: 18, HIS: 39, GEO: 31, CRE: 41, BST: 29 },
  // s-41: Rose Nduta
  's-41': { MAT: 32, ENG: 30, KIS: 35, BIO: 28, CHE: 18, PHY: 16, HIS: 37, GEO: 29, CRE: 39, BST: 27 },
  // s-42: Edwin Juma
  's-42': { MAT: 30, ENG: 28, KIS: 33, BIO: 26, CHE: 16, PHY: 14, HIS: 35, GEO: 27, CRE: 37, BST: 25 },
  // Form 4 West marks
  'sw-1': { MAT: 75, ENG: 70, KIS: 74, BIO: 65, CHE: 62, PHY: 68, HIS: 78, GEO: 72, CRE: 80, BST: 70 },
  'sw-2': { MAT: 68, ENG: 65, KIS: 69, BIO: 58, CHE: 55, PHY: 60, HIS: 71, GEO: 64, CRE: 75, BST: 62 },
  'sw-3': { MAT: 62, ENG: 60, KIS: 64, BIO: 54, CHE: 50, PHY: 52, HIS: 66, GEO: 58, CRE: 70, BST: 58 },
  'sw-4': { MAT: 55, ENG: 52, KIS: 58, BIO: 48, CHE: 42, PHY: 44, HIS: 60, GEO: 52, CRE: 64, BST: 50 },
};

export const INITIAL_TEACHER_PROFILE: TeacherProfile = {
  name: 'Mr. David Mutua',
  tscNumber: 'TSC/489124/2012',
  email: 'd.mutua@kabaraksec.ac.ke',
  phone: '+254 722 345 678',
  department: 'Mathematics & Physical Sciences',
  assignedStream: 'Form 4 East',
  subjectsTaught: ['Mathematics (MAT)', 'Physics (PHY)'],
};

export const INITIAL_WHATSAPP_MESSAGES: WhatsAppMessage[] = [
  {
    id: 'msg-1',
    studentId: 's-1',
    studentAdm: '4012',
    studentName: 'Brian Kiprono',
    parentName: 'Mr. Kiprono Sang',
    parentPhone: '+254 712 111 222',
    sender: 'teacher',
    text: 'Good afternoon Mr. Sang. Brian has attained Grade A (81 pts) in the Form 4 East End-term exam, ranking #1 in class. Congratulations on his sterling effort!',
    timestamp: '14:20',
    status: 'read',
  },
  {
    id: 'msg-2',
    studentId: 's-1',
    studentAdm: '4012',
    studentName: 'Brian Kiprono',
    parentName: 'Mr. Kiprono Sang',
    parentPhone: '+254 712 111 222',
    sender: 'parent',
    text: 'Asante sana Mwalimu Mutua! We are delighted. We will continue encouraging him in Physics revision over the holiday.',
    timestamp: '14:35',
    status: 'read',
  },
  {
    id: 'msg-3',
    studentId: 's-2',
    studentAdm: '4018',
    studentName: 'Faith Chebet',
    parentName: 'Mrs. Chebet Cheruiyot',
    parentPhone: '+254 723 333 444',
    sender: 'teacher',
    text: 'Habari Mrs. Cheruiyot. Faith attained Grade A- (78 pts) ranking #2 overall. Her performance in Sciences is commendable.',
    timestamp: '14:40',
    status: 'delivered',
  },
  {
    id: 'msg-4',
    studentId: 's-12',
    studentAdm: '4045',
    studentName: 'Dennis Kipkemoi',
    parentName: 'Mr. Kipkemoi Bett',
    parentPhone: '+254 734 555 666',
    sender: 'teacher',
    text: 'Dear Mr. Bett, Dennis has achieved a C+ (53 pts). He is very close to a B- grade. We recommend 30 minutes extra daily practice on Chemistry organic equations.',
    timestamp: '15:10',
    status: 'delivered',
  },
];

