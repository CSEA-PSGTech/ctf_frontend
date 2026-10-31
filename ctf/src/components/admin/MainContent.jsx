import ViewPage from './ViewPage';
import CategoriesPage from './CategoriesPage';
import QuestionsPage from './QuestionsPage';
import UsersPage from './UsersPage';
import EditCategory from './EditCategory';
import EditQuestion from './EditQuestion';

function MainContent({
	activeMenu,
	editingCategory,
	editingQuestion,
	onEditCategory,
	onEditQuestion,
	onBackToOverview,
	categories = [],
	questions = [],
	loading = false,
	refreshData
}) {
	if (editingCategory) {
		return (
			<main className="admin-main-content">
				<EditCategory
					category={editingCategory}
					onBack={onBackToOverview}
					refreshData={refreshData}
				/>
			</main>
		);
	}

	if (editingQuestion) {
		return (
			<main className="admin-main-content">
				<EditQuestion
					category={editingQuestion.category}
					question={editingQuestion.question}
					onBack={onBackToOverview}
					refreshData={refreshData}
				/>
			</main>
		);
	}

	return (
		<main className="admin-main-content">
			{loading ? (
				<div className="cinema-empty-state">
					
					<p>Loading Director Deck...</p>
				</div>
			) : (
				<>
					{activeMenu === 'Overview' && (
						<ViewPage
							onEditCategory={onEditCategory}
							onEditQuestion={onEditQuestion}
							categories={categories}
							questions={questions}
							refreshData={refreshData}
						/>
					)}

					{activeMenu === 'Categories' && (
						<CategoriesPage 
							categories={categories}
							refreshData={refreshData}
							onEditCategory={onEditCategory}
						/>
					)}

					{activeMenu === 'Questions' && (
						<QuestionsPage 
							categories={categories}
							refreshData={refreshData} 
						/>
					)}

					{activeMenu === 'Users' && (
						<UsersPage />
					)}
				</>
			)}
		</main>
	);
}

export default MainContent;
