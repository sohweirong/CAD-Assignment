const isHome = (arg1, arg2, options) => {
    const fnResult = (arg1 == arg2) ? options.fn(this) : options.inverse(this);
    return fnResult;
};

exports.isHome = isHome;