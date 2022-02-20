const isEqual = (arg1, arg2, options) => {
    const fnResult = (arg1 == arg2) ? options.fn(this) : options.inverse(this);
    return fnResult;
};

const isContain = (arg1, arg2, options) => {
    console.log(arg1,arg2)
    const fnResult = arg1.includes(arg2) ? options.fn(this) : options.inverse(this);
    return fnResult;
};

exports.isEqual = isEqual;
exports.isContain = isContain;