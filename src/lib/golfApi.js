const API_KEY = 'ZZUMWCD2SGFFT5COACK75DTNIE';
const BASE_URL = 'https://api.golfcourseapi.com/v1';

// Function to search for golf courses by name
export const searchCourses = async (query) => {
  if (!query || query.length < 3) {
    return [];
  }
  
  try {
    const url = `${BASE_URL}/search?search_query=${query}`;
    console.log("Requesting URL:", url);
    const response = await fetch(url, {
      headers: {
        'Authorization': `Key ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorBody = await response.text();
      console.error('API Error Response:', errorBody);
      throw new Error('Failed to fetch courses.');
    }
    
    const data = await response.json();
    return data.courses;
  } catch (error) {
    console.error('Error searching courses:', error);
    return [];
  }
};

// Function to get detailed information for a single course, including hole data
export const getCourseDetails = async (courseId) => {
  try {
    console.log(`Fetching details for courseId: ${courseId}`);
    const response = await fetch(`${BASE_URL}/courses/${courseId}`, {
      headers: {
        'Authorization': `Key ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorBody = await response.text();
      console.error('API Error Response:', errorBody);
      throw new Error('Failed to fetch course details.');
    }
    
    const data = await response.json();
    console.log('Course Details Response:', JSON.stringify(data, null, 2));

    const courseData = data.course;

    // Check for the correct structure: tees.male or tees.female
    if (courseData && courseData.tees) {
      // Try male tees first, then female tees
      const maleTees = courseData.tees.male || [];
      const femaleTees = courseData.tees.female || [];
      const allTees = [...maleTees, ...femaleTees];
      
      if (allTees.length > 0) {
        // Prefer a standard 18-hole tee type, but fall back to the first one
        const bestTeeType = allTees.find(t => t.number_of_holes === 18) || allTees[0];
        
        if (bestTeeType.holes && bestTeeType.holes.length > 0) {
          return {
            id: courseData.id,
            course_name: courseData.course_name,
            holes: bestTeeType.holes,
            par: bestTeeType.par_total,
            tee_name: bestTeeType.tee_name,
          };
        }
      }
    }

    console.error('Could not find valid tee type with hole data in response:', data);
    return null;
  } catch (error) {
    console.error('Error fetching course details:', error);
    return null;
  }
}; 