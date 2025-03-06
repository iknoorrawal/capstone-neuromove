import React, { useState, useEffect } from 'react';
import { Box, Typography, List, ListItem, ListItemText, Divider, Button, TextField, IconButton } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

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

  const renderContent = () => {
    if (activeSection === 'personal') {
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
    }

    if (activeSection === 'physio') {
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
        </Box>
      );
    }

    if (activeSection === 'emergency') {
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
    }

    return null;
  };

  return (
    <Box sx={{ p: 4 }}>
      {/* Header - Left aligned */}
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: 4,
          maxWidth: '250px'
        }}
      >
        <IconButton 
          onClick={() => navigate(`/dashboard/${uid}`)}
          sx={{ mr: 2 }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" sx={{ fontWeight: 'medium' }}>
          Settings
        </Typography>
      </Box>

      {/* Main content - Centered */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center',
        width: '100%'
      }}>
        <Box sx={{ 
          display: 'flex', 
          gap: 4, 
          maxWidth: '1000px',
          width: '100%'
        }}>
          {/* Left sidebar */}
          <Box sx={{ width: '250px', flexShrink: 0 }}>
            <List sx={{ '& .MuiListItem-root': { px: 0 } }}>
              <ListItem 
                button 
                onClick={() => setActiveSection('personal')}
                sx={{ mb: 1 }}
              >
                <ListItemText 
                  primary="Personal Information" 
                  primaryTypographyProps={{ 
                    color: activeSection === 'personal' ? 'black' : 'text.secondary',
                    fontWeight: activeSection === 'personal' ? 700 : 'regular'
                  }}
                />
              </ListItem>
              <ListItem 
                button 
                onClick={() => setActiveSection('physio')}
                sx={{ mb: 1 }}
              >
                <ListItemText 
                  primary="Physiotherapist Information"
                  primaryTypographyProps={{ 
                    color: activeSection === 'physio' ? 'black' : 'text.secondary',
                    fontWeight: activeSection === 'physio' ? 700 : 'regular'
                  }}
                />
              </ListItem>
              <ListItem 
                button
                onClick={() => setActiveSection('emergency')}
                sx={{ mb: 1 }}
              >
                <ListItemText 
                  primary="Emergency Contact"
                  primaryTypographyProps={{ 
                    color: activeSection === 'emergency' ? 'black' : 'text.secondary',
                    fontWeight: activeSection === 'emergency' ? 700 : 'regular'
                  }}
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Data Export"
                  primaryTypographyProps={{ color: 'text.secondary' }}
                />
              </ListItem>
            </List>
          </Box>

          {/* Vertical Divider */}
          <Divider orientation="vertical" flexItem />

          {/* Right content */}
          <Box sx={{ flex: 1, maxWidth: '600px' }}>
            {renderContent()}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Settings; 