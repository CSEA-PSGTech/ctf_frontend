import { useState, useRef, useEffect } from 'react';
import Sidebar from '../components/admin/Sidebar';
import MainContent from '../components/admin/MainContent';
import './Admin.css';
import { getCategoriesAdmin, getQuestionsAdmin, checkIsAdmin } from '../api.js';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Admin() {
	const [activeMenu, setActiveMenu] = useState('Overview');
	const [editingCategory, setEditingCategory] = useState(null);
	const [editingQuestion, setEditingQuestion] = useState(null);
	const [categories, setCategories] = useState([]);
	const [questions, setQuestions] = useState([]);
	const [loading, setLoading] = useState(true);
	const scrollPositionRef = useRef(0);
	const navigate = useNavigate();
	const { logout } = useAuth();

	// Verify admin status with backend, then fetch data if allowed
	useEffect(() => {
		let mounted = true;

		const verify = async () => {
			try {
				setLoading(true);
				const res = await checkIsAdmin();
				if (!mounted) return;
				if (!res || !res.flag) {
					navigate('/login');
					return;
				}
				await fetchData();
			} catch (err) {
				navigate('/login');
			} finally {
				if (mounted) setLoading(false);
			}
		};

		verify();

		return () => { mounted = false; };
	}, [navigate]);

	const fetchData = async () => {
		try {
			setLoading(true);
			const [cats, ques] = await Promise.all([
				getCategoriesAdmin(),
				getQuestionsAdmin()
			]);

			setCategories(Array.isArray(cats?.data) ? cats.data : []);
			setQuestions(Array.isArray(ques?.data) ? ques.data : []);
		} catch (err) {
			// Silent fail for admin data loading
		} finally {
			setLoading(false);
		}
	};

	const handleEditCategory = (category) => {
		const mainContent = document.querySelector('.admin-main-content');
		if (mainContent) scrollPositionRef.current = mainContent.scrollTop;
		setEditingCategory(category);
		setActiveMenu('Categories');
	};

	const handleEditQuestion = (category, question) => {
		const mainContent = document.querySelector('.admin-main-content');
		if (mainContent) scrollPositionRef.current = mainContent.scrollTop;
		setEditingQuestion({ category, question });
		setActiveMenu('Questions');
	};

	const handleBackToOverview = () => {
		setEditingCategory(null);
		setEditingQuestion(null);
		fetchData();
		setTimeout(() => {
			const mainContent = document.querySelector('.admin-main-content');
			if (mainContent) mainContent.scrollTop = scrollPositionRef.current;
		}, 0);
	};

	const handleLogout = async () => {
		await logout();
		navigate('/login');
	};

	return (
		<div className="admin-arena">
			<div className="admin-spotlight" />

			{/* Top Director Header */}
			<header className="admin-top-header">
				<div className="admin-branding">
					
					<div className="admin-title-group">
						<h1>KOLLYWOOD CTF</h1>
						<span>Director Suite • Admin Portal</span>
					</div>
				</div>

				<div className="admin-header-actions">
					<Link to="/challenge" className="admin-nav-link">
						Live Challenges
					</Link>
					<Link to="/leaderboard" className="admin-nav-link">
						Leaderboard
					</Link>
					<button onClick={handleLogout} className="admin-logout-btn">
						
						<span>Exit Suite</span>
					</button>
				</div>
			</header>

			{/* Admin Layout */}
			<div className="admin-body">
				<Sidebar 
					activeMenu={activeMenu} 
					setActiveMenu={(menu) => {
						setEditingCategory(null);
						setEditingQuestion(null);
						setActiveMenu(menu);
					}} 
				/>
				<MainContent
					activeMenu={activeMenu}
					editingCategory={editingCategory}
					editingQuestion={editingQuestion}
					onEditCategory={handleEditCategory}
					onEditQuestion={handleEditQuestion}
					onBackToOverview={handleBackToOverview}
					categories={categories}
					questions={questions}
					loading={loading}
					refreshData={fetchData}
				/>
			</div>
		</div>
	);
}

export default Admin;
