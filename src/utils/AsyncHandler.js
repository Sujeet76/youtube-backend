export const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((e) => {
      // console.log("inside", e);
      return next(e);
    });
  };
};

// alternate way to do
// export const AsyncHandlerAlternate = (requestHandler) => async(req,res,next) =>{
//   try {
//     await requestHandler(req,res,next);
//   } catch (error) {
//     res.status(500).json({
//       message : "Internal server error",
//       success : false,
//     })
//   }
// }
// alternate way to do
// export function AsyncHandlerAlternate(requestHandler) {
//   return async function (req, res, next) {
//     try {
//       await requestHandler(req, res, next);
//     } catch (error) {
//       res.status(error.code || 500).json({
//         message: "Internal server error",
//         success: false,
//         error,
//       });
//     }
//   };
// }
