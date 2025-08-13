import User from '../models/user.js';

// Get user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Profile fetched successfully',
      user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update profile (common fields for all user types)
const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const userType = req.user.userType;
    let updateData = { ...req.body };
    
    // Remove sensitive fields that shouldn't be updated here
    delete updateData.password;
    delete updateData.userType;
    delete updateData._id;
    delete updateData.deliveryAddresses;
    delete updateData.menuItems;

    // Validate based on user type
    if (userType === 'Customer') {
      // Customer can update: name, phone, email, preferredLanguage
      const allowedFields = ['name', 'phone', 'email', 'preferredLanguage'];
      const filteredUpdate = {};
      
      allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          filteredUpdate[field] = updateData[field];
        }
      });
      
      updateData = filteredUpdate;
      
    } else if (userType === 'Owner') {
      // Owner can update: name, phone, email, restaurantName, restaurantDescription
      const allowedFields = ['name', 'phone', 'email', 'restaurantName', 'restaurantDescription', 'restaurantLocation'];
      const filteredUpdate = {};
      
      allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          filteredUpdate[field] = updateData[field];
        }
      });
      
      updateData = filteredUpdate;
    }

    // Check for duplicate phone/email if being updated
    if (updateData.phone || updateData.email) {
      const query = {
        _id: { $ne: userId },
        $or: []
      };
      
      if (updateData.phone) {
        query.$or.push({ phone: updateData.phone });
      }
      if (updateData.email) {
        query.$or.push({ email: updateData.email });
      }

      const existingUser = await User.findOne(query);

      if (existingUser) {
        return res.status(400).json({ 
          message: 'Phone number or email already exists' 
        });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Duplicate phone or email' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Add delivery address (Customer only)
const addDeliveryAddress = async (req, res) => {
  try {
    if (req.user.userType !== 'Customer') {
      return res.status(403).json({ message: 'Access denied. Customers only.' });
    }

    const { street, area, district, city, isDefault } = req.body;

    if (!street || !area || !district || !city) {
      return res.status(400).json({ message: 'All address fields are required' });
    }

    const user = await User.findById(req.user._id);

    // If this is set as default, make all others non-default
    if (isDefault) {
      user.deliveryAddresses.forEach(address => {
        address.isDefault = false;
      });
    }

    // If this is the first address, make it default
    const makeDefault = isDefault || user.deliveryAddresses.length === 0;

    user.deliveryAddresses.push({
      street,
      area,
      district,
      city,
      isDefault: makeDefault
    });

    await user.save();

    res.json({
      message: 'Address added successfully',
      addresses: user.deliveryAddresses
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update delivery address (Customer only)
const updateDeliveryAddress = async (req, res) => {
  try {
    if (req.user.userType !== 'Customer') {
      return res.status(403).json({ message: 'Access denied. Customers only.' });
    }

    const { addressId } = req.params;
    const { street, area, district, city, isDefault } = req.body;

    const user = await User.findById(req.user._id);
    const address = user.deliveryAddresses.id(addressId);

    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    // Update address fields
    if (street) address.street = street;
    if (area) address.area = area;
    if (district) address.district = district;
    if (city) address.city = city;

    // If setting as default, make others non-default
    if (isDefault) {
      user.deliveryAddresses.forEach(addr => {
        addr.isDefault = addr._id.toString() === addressId;
      });
    }

    await user.save();

    res.json({
      message: 'Address updated successfully',
      addresses: user.deliveryAddresses
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete delivery address (Customer only)
const deleteDeliveryAddress = async (req, res) => {
  try {
    if (req.user.userType !== 'Customer') {
      return res.status(403).json({ message: 'Access denied. Customers only.' });
    }

    const { addressId } = req.params;
    const user = await User.findById(req.user._id);
    
    const addressIndex = user.deliveryAddresses.findIndex(
      addr => addr._id.toString() === addressId
    );

    if (addressIndex === -1) {
      return res.status(404).json({ message: 'Address not found' });
    }

    const wasDefault = user.deliveryAddresses[addressIndex].isDefault;
    user.deliveryAddresses.splice(addressIndex, 1);

    // If deleted address was default, make first remaining address default
    if (wasDefault && user.deliveryAddresses.length > 0) {
      user.deliveryAddresses[0].isDefault = true;
    }

    await user.save();

    res.json({
      message: 'Address deleted successfully',
      addresses: user.deliveryAddresses
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add menu item (Owner only)
const addMenuItem = async (req, res) => {
  try {
    if (req.user.userType !== 'Owner') {
      return res.status(403).json({ message: 'Access denied. Owners only.' });
    }

    const { name, description, price, category, image } = req.body;

    if (!name || !description || !price || !category) {
      return res.status(400).json({ message: 'Name, description, price and category are required' });
    }

    if (price <= 0) {
      return res.status(400).json({ message: 'Price must be greater than 0' });
    }

    const user = await User.findById(req.user._id);

    user.menuItems.push({
      name,
      description,
      price: parseFloat(price),
      category,
      image: image || '',
      isAvailable: true
    });

    await user.save();

    res.json({
      message: 'Menu item added successfully',
      menuItems: user.menuItems
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update menu item (Owner only)
const updateMenuItem = async (req, res) => {
  try {
    if (req.user.userType !== 'Owner') {
      return res.status(403).json({ message: 'Access denied. Owners only.' });
    }

    const { itemId } = req.params;
    const { name, description, price, category, isAvailable, image } = req.body;

    const user = await User.findById(req.user._id);
    const menuItem = user.menuItems.id(itemId);

    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    // Update fields if provided
    if (name) menuItem.name = name;
    if (description) menuItem.description = description;
    if (price && price > 0) menuItem.price = parseFloat(price);
    if (category) menuItem.category = category;
    if (image !== undefined) menuItem.image = image;
    if (isAvailable !== undefined) menuItem.isAvailable = isAvailable;

    await user.save();

    res.json({
      message: 'Menu item updated successfully',
      menuItems: user.menuItems
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete menu item (Owner only)
const deleteMenuItem = async (req, res) => {
  try {
    if (req.user.userType !== 'Owner') {
      return res.status(403).json({ message: 'Access denied. Owners only.' });
    }

    const { itemId } = req.params;
    const user = await User.findById(req.user._id);
    
    const itemIndex = user.menuItems.findIndex(
      item => item._id.toString() === itemId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    user.menuItems.splice(itemIndex, 1);
    await user.save();

    res.json({
      message: 'Menu item deleted successfully',
      menuItems: user.menuItems
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export {
  getProfile,
  updateProfile,
  addDeliveryAddress,
  updateDeliveryAddress,
  deleteDeliveryAddress,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem
};