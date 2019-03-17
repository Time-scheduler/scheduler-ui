const styles = theme => ({
  container: {
    width: `${theme.spacing.unit * 68}px`,
    padding: 0,
    paddingBottom: theme.spacing.unit * 2,
  },
  content: {
    padding: theme.spacing.unit * 2,
    paddingTop: 0,
  },
  header: {
    overflow: 'hidden',
    paddingTop: theme.spacing.unit / 2,
  },
  closeButton: {
    float: 'right',
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'flex-end',
    padding: `0 ${theme.spacing.unit * 2}px`,
  },
  button: {
    marginLeft: theme.spacing.unit * 2,
  },
  picker: {
    marginRight: theme.spacing.unit * 2,
    '&:last-child': {
      marginRight: 0,
    },
  },
  wrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: `${theme.spacing.unit}px 0px`,
  },
  icon: {
    margin: `${theme.spacing.unit * 2}px 0`,
    marginRight: `${theme.spacing.unit * 2}px`,
  },
  textField: {
    width: '100%',
  },
});

export default styles;
