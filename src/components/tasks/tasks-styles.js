const styles = theme => ({
  fab: {
        margin: theme.spacing.unit,
  },
  paper: {
        marginTop: theme.spacing.unit * 8,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: `${theme.spacing.unit * 5}px ${theme.spacing.unit * 5}px ${theme.spacing.unit * 5}px`,
  },
  extendedIcon: {
        marginRight: theme.spacing.unit,
  },
  form: {
        width: '100%', // Fix IE 11 issue.
        marginTop: theme.spacing.unit,
  },
  submit: {
        marginTop: theme.spacing.unit * 3,
  },
});

export default styles;
 
