import React from "react";
import {
  Grid,
  Switch,
  FormControlLabel,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Tooltip,
  InputAdornment,
} from "@mui/material";
import icons from "../ui/icons.js";

const VariableForm = ({
  values,
  onChange,
  type = "global",
  unidadOptions = [],
  secretariaOptions = [],
}) => {
  const handleChange = (name) => (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    onChange(name, value);
  };

  const infoAdornment = (title) => (
    <InputAdornment position="end">
      <Tooltip title={title}>
        <icons.infoOutlined fontSize="small" color="action" />
      </Tooltip>
    </InputAdornment>
  );

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        <TextField
          label="Nombre"
          value={values.nombre || ""}
          onChange={handleChange("nombre")}
          fullWidth
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <InputLabel>Unidad de medida</InputLabel>
          <Select
            value={values.unidad_medida || ""}
            label="Unidad de medida"
            onChange={handleChange("unidad_medida")}
          >
            {unidadOptions.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="Valor mínimo"
          type="number"
          value={values.valor_minimo || ""}
          onChange={handleChange("valor_minimo")}
          fullWidth
          InputProps={{ endAdornment: infoAdornment("Valor mínimo permitido") }}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="Valor máximo"
          type="number"
          value={values.valor_maximo || ""}
          onChange={handleChange("valor_maximo")}
          fullWidth
          InputProps={{ endAdornment: infoAdornment("Valor máximo permitido") }}
        />
      </Grid>

      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Switch
              checked={Boolean(values.flexible)}
              onChange={handleChange("flexible")}
              color="primary"
            />
          }
          label="Variable flexible"
        />
      </Grid>

      {!values.flexible && (
        <>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Umbral crítico"
              type="number"
              value={values.umbral_critico || ""}
              onChange={handleChange("umbral_critico")}
              fullWidth
              helperText="Valor a partir del cual se considera saturado"
              InputProps={{
                endAdornment: infoAdornment("Señala el límite crítico"),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Umbral preventivo"
              type="number"
              value={values.umbral_preventivo || ""}
              onChange={handleChange("umbral_preventivo")}
              fullWidth
              helperText="Valor a partir del cual se activa la alerta"
              InputProps={{
                endAdornment: infoAdornment("Umbral antes del crítico"),
              }}
            />
          </Grid>
        </>
      )}

      {values.flexible && (
        <>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Umbral crítico inferior"
              type="number"
              value={values.umbral_critico_inferior || ""}
              onChange={handleChange("umbral_critico_inferior")}
              fullWidth
              helperText="Por debajo del valor ideal"
              InputProps={{
                endAdornment: infoAdornment("Límite crítico inferior"),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Umbral preventivo inferior"
              type="number"
              value={values.umbral_preventivo_inferior || ""}
              onChange={handleChange("umbral_preventivo_inferior")}
              fullWidth
              helperText="Por debajo del valor ideal"
              InputProps={{
                endAdornment: infoAdornment("Límite preventivo inferior"),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Umbral preventivo superior"
              type="number"
              value={values.umbral_preventivo_superior || ""}
              onChange={handleChange("umbral_preventivo_superior")}
              fullWidth
              helperText="Por encima del valor ideal"
              InputProps={{
                endAdornment: infoAdornment("Límite preventivo superior"),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Umbral crítico superior"
              type="number"
              value={values.umbral_critico_superior || ""}
              onChange={handleChange("umbral_critico_superior")}
              fullWidth
              helperText="Por encima del valor ideal"
              InputProps={{
                endAdornment: infoAdornment("Límite crítico superior"),
              }}
            />
          </Grid>
        </>
      )}

      {type === "especifica" && (
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Secretaría</InputLabel>
            <Select
              value={values.secretaria || ""}
              label="Secretaría"
              onChange={handleChange("secretaria")}
            >
              {secretariaOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>Seleccione la secretaría asociada</FormHelperText>
          </FormControl>
        </Grid>
      )}
    </Grid>
  );
};

export default VariableForm;
