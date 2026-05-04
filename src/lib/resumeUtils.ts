/**
 * The Professional Download Fix for Resumes:
 * Since many browser PDF viewers conflict with Cloudinary's headers,
 * this utility forces a native download of the file. This ensures the 
 * file is delivered safely to the user's computer for viewing.
 */
export const openResume = (url?: string) => {
    if (!url) return;
    
    // Create a hidden anchor element to trigger the download
    const link = document.createElement('a');
    
    // Append the fl_attachment flag to ensure Cloudinary sends the correct headers
    const downloadUrl = url.includes('?') 
        ? `${url}&fl_attachment=true` 
        : `${url}?fl_attachment=true`;
        
    link.href = downloadUrl;
    link.target = '_blank';
    link.setAttribute('download', 'resume.pdf');
    
    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
