async function request(url: string, options: RequestInit = {}) {
  const config = {
    ...options,
    credentials: (options.credentials as any) || 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  const res = await fetch(url, config);
  if (res.status === 401) {
    throw new Error('Unauthorized');
  }
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw errorBody;
  }
  return res.json();
}

export const api = {
  login: (email: string, password: string) => 
    request("/api/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  register: (email: string, password: string, role?: string) => 
    request("/api/register", {
      method: "POST",
      body: JSON.stringify({ email, password, role }),
    }),
  logout: () => request("/api/logout", { method: "POST" }),
  getMe: () => request("/api/me"),
  getDashboardStatus: () => request("/api/dashboard/status"),
  uploadMedia: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return fetch("/api/upload-media", {
      method: "POST",
      body: formData, // fetch will correctly set content-type with boundary when sending FormData
      // We manually fetch here because request() helper enforces JSON content-type
    }).then(res => {
      if (res.status === 401) throw new Error('Unauthorized');
      if (!res.ok) return res.json().then(e => { throw e });
      return res.json();
    });
  },
  
  getDetections: () => request("/api/detections"),
  analyzeMedia: (url: string, camera_id?: string) => 
    request("/api/analyze-media", {
      method: "POST",
      body: JSON.stringify({ url, camera_id }),
    }),
  recordDetection: (data: any) => 
    request("/api/detections", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  analyzeVideo: (data: { camera_id: string; video_url: string }) => 
    request("/api/analyze-video", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getCameras: () => request("/api/cameras"),
  addCamera: (data: any) => 
    request("/api/cameras", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateCameraStatus: (id: string, status: string) =>
    request(`/api/cameras/${id}/status`, {
      method: "POST",
      body: JSON.stringify({ status }),
    }),
  getAlerts: () => request("/api/alerts"),
  acknowledgeAlert: (id: number) => 
    request(`/api/alerts/${id}/acknowledge`, { method: "POST" }),
  getBiodiversityReport: () => request("/api/reports/biodiversity"),
};
