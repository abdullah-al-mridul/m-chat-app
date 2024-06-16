// eslint-disable-next-line react/prop-types
const Avater = ({
  // eslint-disable-next-line react/prop-types
  src,
}) => {
  return (
    <div>
      {src && (
        <img
          className="object-cover w-9 h-9 rounded-full"
          src={src}
          alt="profilePic"
        />
      )}
    </div>
  );
};

export default Avater;
