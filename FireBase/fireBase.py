import pandas as pd
import firebase_admin

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import linear_kernel
from firebase_admin import credentials
from firebase_admin import firestore
cred = credentials.Certificate(r"C:\Users\96656\Desktop\Clip_fasial\FireBase\FinalPrivateKye.json")
firebase_admin.initialize_app(cred)

df_base  = pd.read_csv(r'C:\Users\96656\Desktop\Clip_fasial\FireBase\Coursera.csv')
db = firestore.client()

# course data as a (dictionary) save all the courses in the CSV file 
course_data = []
#converting the CSV file to a dictonary and added it to the course_data var
for index, row in df_base.iterrows():
    course_dict = row.to_dict()  # Convert row to dictionary

    course_data.append(course_dict) 



# Reference courses Firestore collection
courses_col = db.collection('courses')

# # Write each course data as a document
for course in course_data:
    try:
      courses_col.add(course)
      # print(f"Added course: {course['Course Name']}")  # Print confirmation 
    except Exception as e:
      print(f"ERROR ADDING course {course} ERROR is : {e}") 




#/////////////////////////////////////////////////////ٌRecommended system /////////////////////////////////

df_course = pd.DataFrame(course_data) # Create a DataFrame named df_course from course_data

tfidf = TfidfVectorizer(stop_words="english") # Create a TF-IDF vectorizer to convert text data into numerical features, removing English stop words.

df_course['Course Name'] = df_course['Course Name'].fillna("") # fill the null values after removing stop words

tfidf_matrix = tfidf.fit_transform(df_course['Course Name']) ## Create TF-IDF vector representation of course names



cosine_sim = linear_kernel(tfidf_matrix ,tfidf_matrix) # Compute cosine similarity matrix between course names using TF-IDF vectors

cosine_indices = pd.Series(df_course.index, index=df_course['Course Name']).drop_duplicates()  # Create a Series for efficient course name lookup with unique indices




# // Reference courses Firestore collection
# recommd_col = db.collection('Recommended_Courses2')




## recomondetion
def get_recommendation(title , cosine_sim = cosine_sim):
    """
  This function recommends similar courses based on a given course title.

  Args:
      title (str): The title of the course for which recommendations are desired.
      cosine_sim (scipy.sparse.csr.csr_matrix, optional): The pre-computed cosine similarity matrix. Defaults to the globally defined `cosine_sim` variable.

  Returns:
      list: A list of course names recommended as similar to the input title (excluding the title itself).
  """
    
    idx = cosine_indices[title] # Look up the original index (numerical row number) for the given course title
    sim_score = list(enumerate(cosine_sim[idx]))  # Get a list of (index, similarity score) tuples for the course with the looked-up index

    sim_score= sorted(sim_score , key = lambda x : x[1] , reverse=True)  # Sort the list of (index, similarity score) tuples by similarity score in descending order (most similar first)

    sim_score = sim_score[1:6]  # Select the top 5 most similar courses (excluding the original course itself) by slicing the list


    sim_indx = [i [0] for i in sim_score]  # Extract the course indices from the top 5 similarity scores
    
    result = df_course["Course Name"].iloc[sim_indx]
    # finding and showing it in the data  (for consedration !OPTINAL!) 
    # rec_df = pd.DataFrame(result)
    # rec_df['similarity score'] = sim_score
    # rec_df = result.tolist()
    rec_list = result.tolist() # Convert Pandas Series to a regular Python list
    
    print("---------------------------------------------------------------------------------------------")
    print('As you enjoyed :' , title , "we recommended thees for you !!")
    print("---------------------------------------------------------------------------------------------")
    sendRecommendation(rec_list, title)
    recommd_col = db.collection('recommended_courses')
def sendRecommendation(recommnded_courses,course):
     
    course_list = recommnded_courses # Get a list of recommended courses
    course_data = { # Create a dictionary to store course data for the database

        'course_title': course,
        'recommended_courses': course_list
    }
    #Try adding the course data to the recommended courses collection
    try:
      recommd_col.add(course_data)
    except Exception as e :
       print(f"ERROR adding to DATABASE {course} and EROR is : {e}")
       
    
    
        

    
    
    


# print(df_course['course_title'].tail())

# Iterate through each course name in the 'Course Name' column of df_course
for course in df_course["Course Name"]: 
  try:
    get_recommendation(course) # Attempt to get recommendations for the current course name
  except Exception as e: 
     print("ERRROR ", e , "course and" ) 


  


# sendRecommendation(rec_course)
