import { Button } from "keep-react";
export const KeepButton = (props) => {
  return (
    <>
      {/* eslint-disable-next-line react/prop-types */}
      <Button {...props}>{props.children}</Button>
    </>
  );
};
