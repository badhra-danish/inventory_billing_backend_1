const { Attribute, AttributeValues } = require("../../models/indexModel");
const sequelize = require("../../config/database");

exports.attributeService = {
  createAttribute: async (attributeData, shop_id) => {
    const transaction = await sequelize.transaction();
    try {
      const { attributeName, status, attributeValues } = attributeData;
      if (!attributeName || !status || !attributeValues) {
        throw new Error("All Feids Are Required");
      }
      const attribute = await Attribute.create(
        {
          attributeName: attributeName,
          shop_id: shop_id,
          status: status,
        },
        { transaction },
      );

      if (attributeValues && attributeValues.length > 0) {
        const attributeValueData = attributeValues.map((val) => ({
          value: val.value,
          attribute_id: attribute.attribute_id,
          shop_id: shop_id,
        }));
        await AttributeValues.bulkCreate(attributeValueData, { transaction });
      }

      const attributewithValues = await Attribute.findByPk(
        attribute.attribute_id,
        {
          include: [
            {
              model: AttributeValues,
              as: "attributeValues",
              attributes: ["attribute_value_id", "value"],
            },
          ],
          transaction,
        },
      );
      await transaction.commit();

      return attributewithValues;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
  updateAttribute: async (attributeID, updatedData, shop_id) => {
    const transaction = await sequelize.transaction();

    try {
      const { attributeName, status, attributeValues } = updatedData;

      const attribute = await Attribute.findOne({
        where: {
          attribute_id: attributeID,
          shop_id: shop_id,
        },
      });
      if (!attribute) throw new Error("Attribute Not Found");

      await attribute.update(
        {
          attributeName: attributeName,
          status: status,
        },
        { transaction },
      );

      if (Array.isArray(attributeValues)) {
        for (const val of attributeValues) {
          if (val.delete == true && val.attribute_value_id) {
            await AttributeValues.destroy({
              where: { attribute_value_id: val.attribute_value_id, shop_id },
              transaction,
            });
            continue;
          }

          if (val.attribute_value_id) {
            await AttributeValues.update(
              { value: val.value },
              {
                where: { attribute_value_id: val.attribute_value_id, shop_id },
                transaction,
              },
            );
            continue;
          }

          await AttributeValues.create(
            {
              value: val.value,
              attribute_id: attributeID,
              shop_id: shop_id,
            },
            { transaction },
          );
        }
      }

      const attributewithValues = await Attribute.findByPk(
        attribute.attribute_id,
        {
          include: [
            {
              model: AttributeValues,
              as: "attributeValues",
              attributes: ["attribute_value_id", "value"],
            },
          ],
          transaction,
        },
      );
      await transaction.commit();
      return attributewithValues;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
  deleteAttribute: async (attributeID, shop_id) => {
    const transaction = await sequelize.transaction();
    try {
      const attribute = await Attribute.findOne(
        {
          where: {
            attribute_id: attributeID,
            shop_id: shop_id,
          },
        },
        { transaction },
      );
      if (!attribute) throw new Error("Attribute not Found");
      //console.log(attribute);

      await AttributeValues.destroy({
        where: { attribute_id: attributeID, shop_id },
        transaction,
      });

      await attribute.destroy({ transaction });

      await transaction.commit();
      return;
    } catch (error) {
      await transaction.rollback();
      console.log(error);
      throw error;
    }
  },
};
