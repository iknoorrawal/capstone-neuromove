import React, { useState, useEffect } from 'react';
import { Box, Typography, List, ListItem, ListItemText, Divider, Button, TextField, IconButton, Checkbox, FormControlLabel, Select, MenuItem, FormControl } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LockIcon from '@mui/icons-material/Lock';

const Settings = () => {
  const { uid } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [activeSection, setActiveSection] = useState('personal');
  const [editMode, setEditMode] = useState({
    name: false,
    email: false,
    phone: false,
    height: false,
    weight: false,
    physioName: false,
    physioEmail: false,
    physioPhone: false,
    emergencyName: false,
    emergencyRelation: false,
    emergencyPhone: false,
  });
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    height: '',
    weight: '',
    physioName: '',
    physioEmail: '',
    physioPhone: '',
    emergencyName: '',
    emergencyRelation: '',
    emergencyPhone: '',
  });
  const [consentChecked, setConsentChecked] = useState(false);
  const [reportFrequency, setReportFrequency] = useState('weekly');
  const [physioEmailError, setPhysioEmailError] = useState('');

  const buttonStyle = {
    textDecoration: 'underline',
    color: 'black',
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.04)',
      color: 'black',
    }
  };

  const actionButtonStyle = {
    color: 'black',
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.04)',
      color: 'black',
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData(data);
          setConsentChecked(data.physioConsent || false);
          setReportFrequency(data.reportFrequency || 'weekly');
          setFormData({
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            email: data.email || '',
            phone: data.phone || '',
            height: data.height || '',
            weight: data.weight || '',
            physioName: data.physioName || '',
            physioEmail: data.physioEmail || '',
            physioPhone: data.physioPhone || '',
            emergencyName: data.emergencyName || '',
            emergencyRelation: data.emergencyRelation || '',
            emergencyPhone: data.emergencyPhone || '',
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [uid]);

  const handleEdit = (field) => {
    setEditMode({ ...editMode, [field]: true });
  };

  const handleSave = async (field) => {
    try {
      const userRef = doc(db, "users", uid);
      let updateData = {};

      switch (field) {
        case 'name':
          updateData = { 
            firstName: formData.firstName, 
            lastName: formData.lastName 
          };
          break;
        case 'email':
          updateData = { email: formData.email };
          break;
        case 'phone':
          updateData = { phone: formData.phone };
          break;
        case 'height':
          updateData = { height: formData.height };
          break;
        case 'weight':
          updateData = { weight: formData.weight };
          break;
        case 'physioName':
          updateData = { physioName: formData.physioName };
          break;
        case 'physioEmail':
          updateData = { physioEmail: formData.physioEmail };
          break;
        case 'physioPhone':
          updateData = { physioPhone: formData.physioPhone };
          break;
        case 'emergencyName':
          updateData = { emergencyName: formData.emergencyName };
          break;
        case 'emergencyRelation':
          updateData = { emergencyRelation: formData.emergencyRelation };
          break;
        case 'emergencyPhone':
          updateData = { emergencyPhone: formData.emergencyPhone };
          break;
        default:
          break;
      }

      await updateDoc(userRef, updateData);
      setUserData({ ...userData, ...updateData });
      setEditMode({ ...editMode, [field]: false });
    } catch (error) {
      console.error("Error updating data:", error);
    }
  };

  const handleCancel = (field) => {
    setEditMode({ ...editMode, [field]: false });
    setFormData({
      ...formData,
      firstName: userData?.firstName || '',
      lastName: userData?.lastName || '',
      email: userData?.email || '',
      phone: userData?.phone || '',
      height: userData?.height || '',
      weight: userData?.weight || '',
      physioName: userData?.physioName || '',
      physioEmail: userData?.physioEmail || '',
      physioPhone: userData?.physioPhone || '',
      emergencyName: userData?.emergencyName || '',
      emergencyRelation: userData?.emergencyRelation || '',
      emergencyPhone: userData?.emergencyPhone || '',
    });
  };

  const handleConsentChange = async (event) => {
    const checked = event.target.checked;
    
    if (checked && (!userData?.physioEmail || userData.physioEmail.trim() === '')) {
      setPhysioEmailError('Please fill out the physiotherapist email address above before enabling consent.');
      return;
    }
    
    setPhysioEmailError('');
    setConsentChecked(checked);
    try {
      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, {
        physioConsent: checked,
        reportFrequency: checked ? reportFrequency : null
      });
      setUserData({ ...userData, physioConsent: checked, reportFrequency: checked ? reportFrequency : null });
    } catch (error) {
      console.error("Error updating consent:", error);
    }
  };

  const handleFrequencyChange = async (event) => {
    const frequency = event.target.value;
    setReportFrequency(frequency);
    try {
      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, {
        reportFrequency: frequency
      });
      setUserData({ ...userData, reportFrequency: frequency });
    } catch (error) {
      console.error("Error updating frequency:", error);
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'personal':
        return (
          <Box sx={{ flex: 1 }}>
            {/* Legal Name */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1" color="text.secondary">Legal name</Typography>
                {!editMode.name ? (
                  <Button variant="text" sx={buttonStyle} onClick={() => handleEdit('name')}>
                    Edit
                  </Button>
                ) : (
                  <Box>
                    <Button variant="text" onClick={() => handleSave('name')} sx={{ ...actionButtonStyle, mr: 1 }}>Save</Button>
                    <Button variant="text" onClick={() => handleCancel('name')} sx={actionButtonStyle}>Cancel</Button>
                  </Box>
                )}
              </Box>
              {!editMode.name ? (
                <Typography variant="body1">{userData?.firstName} {userData?.lastName}</Typography>
              ) : (
                <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                  <TextField
                    size="small"
                    label="First Name"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                  <TextField
                    size="small"
                    label="Last Name"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </Box>
              )}
              <Divider sx={{ mt: 2 }} />
            </Box>

            {/* Email */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1" color="text.secondary">Email address</Typography>
                {!editMode.email ? (
                  <Button variant="text" sx={buttonStyle} onClick={() => handleEdit('email')}>
                    Edit
                  </Button>
                ) : (
                  <Box>
                    <Button variant="text" onClick={() => handleSave('email')} sx={{ ...actionButtonStyle, mr: 1 }}>Save</Button>
                    <Button variant="text" onClick={() => handleCancel('email')} sx={actionButtonStyle}>Cancel</Button>
                  </Box>
                )}
              </Box>
              {!editMode.email ? (
                <Typography variant="body1">{userData?.email}</Typography>
              ) : (
                <TextField
                  fullWidth
                  size="small"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              )}
              <Divider sx={{ mt: 2 }} />
            </Box>

            {/* Phone */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1" color="text.secondary">Phone number</Typography>
                {!editMode.phone && !userData?.phone ? (
                  <Button variant="text" sx={buttonStyle} onClick={() => handleEdit('phone')}>
                    Add
                  </Button>
                ) : !editMode.phone ? (
                  <Button variant="text" sx={buttonStyle} onClick={() => handleEdit('phone')}>
                    Edit
                  </Button>
                ) : (
                  <Box>
                    <Button variant="text" onClick={() => handleSave('phone')} sx={{ ...actionButtonStyle, mr: 1 }}>Save</Button>
                    <Button variant="text" onClick={() => handleCancel('phone')} sx={actionButtonStyle}>Cancel</Button>
                  </Box>
                )}
              </Box>
              {!editMode.phone ? (
                <Typography variant="body1" color={userData?.phone ? 'text.primary' : 'text.secondary'}>
                  {userData?.phone || 'Not provided'}
                </Typography>
              ) : (
                <TextField
                  fullWidth
                  size="small"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              )}
              <Divider sx={{ mt: 2 }} />
            </Box>

            {/* Height */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1" color="text.secondary">Height (cms)</Typography>
                {!editMode.height && !userData?.height ? (
                  <Button variant="text" sx={buttonStyle} onClick={() => handleEdit('height')}>
                    Add
                  </Button>
                ) : !editMode.height ? (
                  <Button variant="text" sx={buttonStyle} onClick={() => handleEdit('height')}>
                    Edit
                  </Button>
                ) : (
                  <Box>
                    <Button variant="text" onClick={() => handleSave('height')} sx={{ ...actionButtonStyle, mr: 1 }}>Save</Button>
                    <Button variant="text" onClick={() => handleCancel('height')} sx={actionButtonStyle}>Cancel</Button>
                  </Box>
                )}
              </Box>
              {!editMode.height ? (
                <Typography variant="body1" color={userData?.height ? 'text.primary' : 'text.secondary'}>
                  {userData?.height || 'Not provided'}
                </Typography>
              ) : (
                <TextField
                  fullWidth
                  size="small"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                />
              )}
              <Divider sx={{ mt: 2 }} />
            </Box>

            {/* Weight */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1" color="text.secondary">Weight (lbs)</Typography>
                {!editMode.weight && !userData?.weight ? (
                  <Button variant="text" sx={buttonStyle} onClick={() => handleEdit('weight')}>
                    Add
                  </Button>
                ) : !editMode.weight ? (
                  <Button variant="text" sx={buttonStyle} onClick={() => handleEdit('weight')}>
                    Edit
                  </Button>
                ) : (
                  <Box>
                    <Button variant="text" onClick={() => handleSave('weight')} sx={{ ...actionButtonStyle, mr: 1 }}>Save</Button>
                    <Button variant="text" onClick={() => handleCancel('weight')} sx={actionButtonStyle}>Cancel</Button>
                  </Box>
                )}
              </Box>
              {!editMode.weight ? (
                <Typography variant="body1" color={userData?.weight ? 'text.primary' : 'text.secondary'}>
                  {userData?.weight || 'Not provided'}
                </Typography>
              ) : (
                <TextField
                  fullWidth
                  size="small"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                />
              )}
              <Divider sx={{ mt: 2 }} />
            </Box>
          </Box>
        );
      case 'physio':
        return (
          <Box sx={{ flex: 1 }}>
            {/* Physiotherapist Name */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1" color="text.secondary">Physiotherapist name</Typography>
                {!editMode.physioName && !userData?.physioName ? (
                  <Button variant="text" sx={buttonStyle} onClick={() => handleEdit('physioName')}>
                    Add
                  </Button>
                ) : !editMode.physioName ? (
                  <Button variant="text" sx={buttonStyle} onClick={() => handleEdit('physioName')}>
                    Edit
                  </Button>
                ) : (
                  <Box>
                    <Button variant="text" onClick={() => handleSave('physioName')} sx={{ ...actionButtonStyle, mr: 1 }}>Save</Button>
                    <Button variant="text" onClick={() => handleCancel('physioName')} sx={actionButtonStyle}>Cancel</Button>
                  </Box>
                )}
              </Box>
              {!editMode.physioName ? (
                <Typography variant="body1" color={userData?.physioName ? 'text.primary' : 'text.secondary'}>
                  {userData?.physioName || 'Not provided'}
                </Typography>
              ) : (
                <TextField
                  fullWidth
                  size="small"
                  value={formData.physioName}
                  onChange={(e) => setFormData({ ...formData, physioName: e.target.value })}
                />
              )}
              <Divider sx={{ mt: 2 }} />
            </Box>

            {/* Physiotherapist Email */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1" color="text.secondary">Physiotherapist Email address</Typography>
                {!editMode.physioEmail && !userData?.physioEmail ? (
                  <Button variant="text" sx={buttonStyle} onClick={() => handleEdit('physioEmail')}>
                    Add
                  </Button>
                ) : !editMode.physioEmail ? (
                  <Button variant="text" sx={buttonStyle} onClick={() => handleEdit('physioEmail')}>
                    Edit
                  </Button>
                ) : (
                  <Box>
                    <Button variant="text" onClick={() => handleSave('physioEmail')} sx={{ ...actionButtonStyle, mr: 1 }}>Save</Button>
                    <Button variant="text" onClick={() => handleCancel('physioEmail')} sx={actionButtonStyle}>Cancel</Button>
                  </Box>
                )}
              </Box>
              {!editMode.physioEmail ? (
                <Typography variant="body1" color={userData?.physioEmail ? 'text.primary' : 'text.secondary'}>
                  {userData?.physioEmail || 'Not provided'}
                </Typography>
              ) : (
                <TextField
                  fullWidth
                  size="small"
                  value={formData.physioEmail}
                  onChange={(e) => setFormData({ ...formData, physioEmail: e.target.value })}
                />
              )}
              <Divider sx={{ mt: 2 }} />
            </Box>

            {/* Physiotherapist Phone */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1" color="text.secondary">Phone number</Typography>
                {!editMode.physioPhone && !userData?.physioPhone ? (
                  <Button variant="text" sx={buttonStyle} onClick={() => handleEdit('physioPhone')}>
                    Add
                  </Button>
                ) : !editMode.physioPhone ? (
                  <Button variant="text" sx={buttonStyle} onClick={() => handleEdit('physioPhone')}>
                    Edit
                  </Button>
                ) : (
                  <Box>
                    <Button variant="text" onClick={() => handleSave('physioPhone')} sx={{ ...actionButtonStyle, mr: 1 }}>Save</Button>
                    <Button variant="text" onClick={() => handleCancel('physioPhone')} sx={actionButtonStyle}>Cancel</Button>
                  </Box>
                )}
              </Box>
              {!editMode.physioPhone ? (
                <Typography variant="body1" color={userData?.physioPhone ? 'text.primary' : 'text.secondary'}>
                  {userData?.physioPhone || 'Not provided'}
                </Typography>
              ) : (
                <TextField
                  fullWidth
                  size="small"
                  value={formData.physioPhone}
                  onChange={(e) => setFormData({ ...formData, physioPhone: e.target.value })}
                />
              )}
              <Divider sx={{ mt: 2 }} />
            </Box>

            {/* Consent Checkbox */}
            <Box sx={{ mb: 4 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={consentChecked}
                    onChange={handleConsentChange}
                    sx={{ 
                      color: 'black',
                      '&.Mui-checked': {
                        color: 'black',
                      },
                    }}
                  />
                }
                label={
                  <Typography variant="body1" sx={{ maxWidth: '600px' }}>
                    I consent to my performance reports being shared with my physiotherapist via the provided email address. 
                    This data will remain confidential and will only be accessible to myself and my physiotherapist for the 
                    purpose of tracking progress and optimizing my rehabilitation plan.
                  </Typography>
                }
              />
              {physioEmailError && (
                <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1, ml: 4 }}>
                  {physioEmailError}
                </Typography>
              )}
              {consentChecked && (
                <Box sx={{ mt: 2, ml: 4 }}>
                  <FormControl size="small" sx={{ minWidth: 250 }}>
                    <Select
                      value={reportFrequency}
                      onChange={handleFrequencyChange}
                      sx={{
                        bgcolor: 'white',
                        '& .MuiSelect-select': {
                          color: 'black',
                        }
                      }}
                    >
                      <MenuItem value="weekly">Send performance report weekly</MenuItem>
                      <MenuItem value="monthly">Send performance report monthly</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              )}
              <Divider sx={{ mt: 2 }} />
            </Box>
          </Box>
        );
      case 'emergency':
        return (
          <Box sx={{ flex: 1 }}>
            {/* Emergency Contact Name */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1" color="text.secondary">Emergency contact name</Typography>
                {!editMode.emergencyName && !userData?.emergencyName ? (
                  <Button variant="text" sx={buttonStyle} onClick={() => handleEdit('emergencyName')}>
                    Add
                  </Button>
                ) : !editMode.emergencyName ? (
                  <Button variant="text" sx={buttonStyle} onClick={() => handleEdit('emergencyName')}>
                    Edit
                  </Button>
                ) : (
                  <Box>
                    <Button variant="text" onClick={() => handleSave('emergencyName')} sx={{ ...actionButtonStyle, mr: 1 }}>Save</Button>
                    <Button variant="text" onClick={() => handleCancel('emergencyName')} sx={actionButtonStyle}>Cancel</Button>
                  </Box>
                )}
              </Box>
              {!editMode.emergencyName ? (
                <Typography variant="body1" color={userData?.emergencyName ? 'text.primary' : 'text.secondary'}>
                  {userData?.emergencyName || 'Not provided'}
                </Typography>
              ) : (
                <TextField
                  fullWidth
                  size="small"
                  value={formData.emergencyName}
                  onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })}
                />
              )}
              <Divider sx={{ mt: 2 }} />
            </Box>

            {/* Emergency Contact Relationship */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1" color="text.secondary">Relationship</Typography>
                {!editMode.emergencyRelation && !userData?.emergencyRelation ? (
                  <Button variant="text" sx={buttonStyle} onClick={() => handleEdit('emergencyRelation')}>
                    Add
                  </Button>
                ) : !editMode.emergencyRelation ? (
                  <Button variant="text" sx={buttonStyle} onClick={() => handleEdit('emergencyRelation')}>
                    Edit
                  </Button>
                ) : (
                  <Box>
                    <Button variant="text" onClick={() => handleSave('emergencyRelation')} sx={{ ...actionButtonStyle, mr: 1 }}>Save</Button>
                    <Button variant="text" onClick={() => handleCancel('emergencyRelation')} sx={actionButtonStyle}>Cancel</Button>
                  </Box>
                )}
              </Box>
              {!editMode.emergencyRelation ? (
                <Typography variant="body1" color={userData?.emergencyRelation ? 'text.primary' : 'text.secondary'}>
                  {userData?.emergencyRelation || 'Not provided'}
                </Typography>
              ) : (
                <TextField
                  fullWidth
                  size="small"
                  value={formData.emergencyRelation}
                  onChange={(e) => setFormData({ ...formData, emergencyRelation: e.target.value })}
                />
              )}
              <Divider sx={{ mt: 2 }} />
            </Box>

            {/* Emergency Contact Phone */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1" color="text.secondary">Phone number</Typography>
                {!editMode.emergencyPhone && !userData?.emergencyPhone ? (
                  <Button variant="text" sx={buttonStyle} onClick={() => handleEdit('emergencyPhone')}>
                    Add
                  </Button>
                ) : !editMode.emergencyPhone ? (
                  <Button variant="text" sx={buttonStyle} onClick={() => handleEdit('emergencyPhone')}>
                    Edit
                  </Button>
                ) : (
                  <Box>
                    <Button variant="text" onClick={() => handleSave('emergencyPhone')} sx={{ ...actionButtonStyle, mr: 1 }}>Save</Button>
                    <Button variant="text" onClick={() => handleCancel('emergencyPhone')} sx={actionButtonStyle}>Cancel</Button>
                  </Box>
                )}
              </Box>
              {!editMode.emergencyPhone ? (
                <Typography variant="body1" color={userData?.emergencyPhone ? 'text.primary' : 'text.secondary'}>
                  {userData?.emergencyPhone || 'Not provided'}
                </Typography>
              ) : (
                <TextField
                  fullWidth
                  size="small"
                  value={formData.emergencyPhone}
                  onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                />
              )}
              <Divider sx={{ mt: 2 }} />
            </Box>
          </Box>
        );
      case 'data':
        return (
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 'medium' }}>
              Account Data Export
            </Typography>
            
            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2 }}>
              Last downloaded: {userData?.lastDataExport ? new Date(userData.lastDataExport).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              }) : 'Never'}
            </Typography>

            <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
              The Data Export PDF provides a comprehensive summary of the player's Neuromove history. 
              This includes all data from play logs and the player's performance for each game.
            </Typography>

            <Button
              variant="text"
              onClick={async () => {
                try {
                  // Show loading state if needed
                  
                  // Call the FastAPI endpoint
                  const response = await fetch(`http://localhost:8000/api/generate-report/${uid}`, {
                    method: 'GET',
                  });
                  
                  if (!response.ok) {
                    throw new Error('Failed to generate report');
                  }
                  
                  // Get the PDF blob
                  const blob = await response.blob();
                  
                  // Create a download link and trigger download
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'neuromove_performance_report.pdf';
                  document.body.appendChild(a);
                  a.click();
                  window.URL.revokeObjectURL(url);
                  document.body.removeChild(a);

                  // Update last download date in Firebase
                  const userRef = doc(db, "users", uid);
                  await updateDoc(userRef, {
                    lastDataExport: new Date().toISOString()
                  });
                  
                  // Update the UI
                  setUserData(prev => ({
                    ...prev,
                    lastDataExport: new Date().toISOString()
                  }));
                } catch (error) {
                  console.error("Error downloading report:", error);
                  // You might want to show an error message to the user
                }
              }}
              sx={{
                color: 'black',
                textDecoration: 'underline',
                textTransform: 'none',
                p: 0,
                '&:hover': {
                  backgroundColor: 'transparent',
                  opacity: 0.7
                }
              }}
            >
              Download
            </Button>
          </Box>
        );
      case 'privacy':
        return (
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>Your Privacy Is Important To Us</Typography>
            
            <Typography variant="body1" paragraph>
              At Neuromove, we are committed to respecting and protecting your privacy regarding
              any information we collect while operating our platform.
            </Typography>

            <Typography variant="body1" paragraph>
              This Privacy Policy applies to Neuromove (hereinafter, "us", "we", or "our"). We respect
              your privacy and are committed to protecting any personally identifiable information
              you provide through our platform. This policy explains what information we collect,
              how we use it, and under what circumstances we may share it with third parties. This
              Privacy Policy applies solely to information collected through our platform and does
              not cover data collected from other sources.
            </Typography>

            <Typography variant="body1" paragraph>
              This Privacy Policy, along with our Terms and Conditions, outlines the general rules
              and policies governing your use of Neuromove. Depending on your activities while
              using our platform, additional terms may apply.
            </Typography>

            <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>Information We Collect</Typography>
            
            <Typography variant="body1" paragraph>
              We may collect non-personally-identifying information that web browsers and servers
              typically make available, such as browser type, language preference, referring site,
              and the date and time of each visitor request. This helps us better understand how
              users interact with our platform. From time to time, we may aggregate and share
              anonymized data, such as general usage trends.
            </Typography>

            <Typography variant="body1" paragraph>
              Certain interactions with Neuromove require us to collect personally identifiable
              information. The type and amount of data depend on the nature of the interaction. For
              example, when a user signs up for Neuromove, we may collect:
            </Typography>

            <Box component="ul" sx={{ pl: 4 }}>
              <Typography component="li">Name and contact details (email, phone number)</Typography>
              <Typography component="li">User preferences and settings</Typography>
              <Typography component="li">Performance data related to rehabilitation exercises</Typography>
            </Box>

            <Typography variant="body1" paragraph>
              This information is used to improve user experience, track progress, and provide
              physiotherapists with insights.
            </Typography>

            <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>Data Analytics & Aggregated Statistics</Typography>
            
            <Typography variant="body1" paragraph>
              Neuromove may collect anonymized statistics about how users interact with our
              platform to enhance performance, improve usability, and refine our rehabilitation
              exercises. These insights may be shared publicly or with relevant stakeholders;
              however, no personally identifiable information will be disclosed.
            </Typography>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh',
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Background Decoration */}
      <Box
        component="img"
        src="/bottom-right-wavy.png"
        alt=""
        sx={{
          position: "absolute",
          bottom: 0,
          right: 0,
          width: "1000px",
          height: "auto",
          zIndex: 0,
          pointerEvents: "none",
          opacity: 0.8
        }}
      />

      {/* Content with higher z-index */}
      <Box sx={{ position: "relative", zIndex: 1, display: "flex", width: "100%" }}>
        {/* Left Sidebar */}
        <Box sx={{ width: 250, borderRight: '1px solid #e0e0e0', p: 3, bgcolor: "white" }}>
          <Box sx={{ mb: 4 }}>
            <Typography 
              variant="h6" 
              component="div" 
              onClick={() => navigate(`/dashboard/${uid}`)}
              sx={{ 
                cursor: 'pointer',
                fontWeight: 'medium',
                mb: 3,
                '&:hover': {
                  opacity: 0.8
                }
              }}
            >
              N E U R O M O V E
            </Typography>
            <Typography variant="h5">Settings</Typography>
          </Box>
          <List>
            <ListItem 
              button 
              onClick={() => setActiveSection('personal')}
              sx={{ 
                bgcolor: activeSection === 'personal' ? 'rgba(0, 0, 0, 0.04)' : 'transparent',
                fontWeight: activeSection === 'personal' ? 'bold' : 'normal',
                color: 'black'
              }}
            >
              <ListItemText primary="Personal Information" />
            </ListItem>
            <ListItem 
              button 
              onClick={() => setActiveSection('physio')}
              sx={{ 
                bgcolor: activeSection === 'physio' ? 'rgba(0, 0, 0, 0.04)' : 'transparent',
                fontWeight: activeSection === 'physio' ? 'bold' : 'normal',
                color: 'black'
              }}
            >
              <ListItemText primary="Physiotherapist Information" />
            </ListItem>
            <ListItem 
              button 
              onClick={() => setActiveSection('emergency')}
              sx={{ 
                bgcolor: activeSection === 'emergency' ? 'rgba(0, 0, 0, 0.04)' : 'transparent',
                fontWeight: activeSection === 'emergency' ? 'bold' : 'normal',
                color: 'black'
              }}
            >
              <ListItemText primary="Emergency Contact" />
            </ListItem>
            <ListItem 
              button 
              onClick={() => setActiveSection('data')}
              sx={{ 
                bgcolor: activeSection === 'data' ? 'rgba(0, 0, 0, 0.04)' : 'transparent',
                fontWeight: activeSection === 'data' ? 'bold' : 'normal',
                color: 'black'
              }}
            >
              <ListItemText primary="Data Export" />
            </ListItem>
            <Divider sx={{ my: 2 }} />
            <ListItem 
              button 
              onClick={() => setActiveSection('privacy')}
              sx={{ 
                bgcolor: activeSection === 'privacy' ? 'rgba(0, 0, 0, 0.04)' : 'transparent',
                fontWeight: activeSection === 'privacy' ? 'bold' : 'normal',
                color: 'black'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LockIcon sx={{ fontSize: 20 }} />
                <ListItemText primary="Privacy Policy" />
              </Box>
            </ListItem>
          </List>
        </Box>

        {/* Main Content */}
        <Box sx={{ 
          flex: 1, 
          p: 4,
          maxWidth: '800px', 
          margin: '0 auto',
          mt: '88px' // This matches the space taken by NEUROMOVE + Settings text + spacing
        }}>
          {renderContent()}
        </Box>
      </Box>
    </Box>
  );
};

export default Settings; 