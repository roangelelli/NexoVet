const Catalogo = require('../models/catalogo.model');
const { leerId } = require('../middlewares/validaciones');

async function especies(req, res) {
  res.json({ especies: await Catalogo.listarEspecies() });
}

// Se puede filtrar por especie: /api/catalogos/razas?especie_id=1
async function razas(req, res) {
  const especieId = req.query.especie_id ? leerId(req.query.especie_id) : null;
  res.json({ razas: await Catalogo.listarRazas(especieId) });
}

async function tiposVacuna(req, res) {
  res.json({ tipos_vacuna: await Catalogo.listarTiposVacuna() });
}

module.exports = { especies, razas, tiposVacuna };
