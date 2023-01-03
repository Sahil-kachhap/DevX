const getAllCourses = (req, res, next) => {
    res.status(200).json({
        'message': 'you will get courses on this route',
    });
};

module.exports = getAllCourses;