<template>
  <q-page>
    <div class="q-pa-md">
      <q-btn
        flat
        size="md"
        label="주문 내역 새로고침"
        icon="refresh"
        @click="getOrders()"
      />
    </div>
    <div class="q-pa-md">
      <q-table
        flat
        bordered
        title="주문 목록"
        :rows="retOrders"
        :columns="columns"
        row-key="order_id"
        :pagination="initialPagination"
      >
        <template v-slot:header="props">
          <q-tr :props="props">
            <q-th v-for="col in props.cols" :key="col.name" :props="props">
              {{ col.label }}
            </q-th>
          </q-tr>
        </template>

        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td v-for="col in props.cols" :key="col.name" :props="props">
              <div v-if="col.name == 'order_time'">
                {{ getDateTimeString(col.value) }}
              </div>
              <div v-else>
                {{ col.value }}
              </div>
            </q-td>
          </q-tr>
          <q-tr :props="props">
            <q-td colspan="100%">
              <q-card flat>
                <q-card-section class="text-h6 text-center">
                  주문 번호 {{ props.row.order_id }} 상세 설명
                </q-card-section>
                <div
                  v-for="(menu_id, menuIndex) in ds(props.row.menu_ids)"
                  :key="menuIndex"
                  class="column items-center"
                >
                  <q-card-section>
                    <div>
                      <div class="text-subtitle1 text-bold">
                        메뉴 {{ menuIndex + 1 }}:
                        {{ getMenuInfo(menu_id).menu_title }}
                      </div>
                      <div class="text-subtitle1 text-bold text-red">
                        수량: {{ ds(props.row.menu_numbers)[menuIndex] }}개
                      </div>
                      <div
                        v-for="(menu_option, optionIndex) in ds(
                          getMenuInfo(menu_id).menu_additional_options
                        )"
                        :key="optionIndex"
                      >
                        {{ menu_option.name }} :
                        {{
                          menu_option.options[
                            ds(props.row.menu_add_options)[menuIndex][
                              optionIndex
                            ]
                          ].label
                        }}
                      </div>
                    </div>
                  </q-card-section>
                </div>
                <q-card-actions align="center" class="q-pb-md">
                  <q-btn
                    v-if="props.row.is_payed == '0'"
                    outline
                    class="text-red"
                    @click="updateOrderToFinsh(props.row.order_id, props.row)"
                    >송금 완료 처리</q-btn
                  >
                  <q-btn
                    v-else
                    outline
                    class="text-blue"
                    @click="updateOrderToUnfinsh(props.row.order_id, props.row)"
                    >송금 취소 처리</q-btn
                  >
                </q-card-actions>
              </q-card>
            </q-td>
          </q-tr>
        </template>
        <template v-slot:top-right>
          <q-btn
            color="primary"
            icon-right="archive"
            label="CSV 다운로드"
            no-caps
            @click="exportTable"
          />
        </template>
      </q-table>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, onMounted, ref } from "vue";
import { api, baseURL } from "boot/axios";
import { storeToRefs } from "pinia";
import { useStoreInfo } from "src/stores/storeInfo";
import exportFile from "quasar/src/utils/export-file.js";
import useQuasar from "quasar/src/composables/use-quasar.js";

export default defineComponent({
  name: "IndexPage",
  setup() {
    // store information
    const storeInfo = useStoreInfo();
    const { allStores, allMenus } = storeToRefs(storeInfo);

    const columns = [
      {
        name: "order_id",
        align: "center",
        label: "주문 번호",
        field: "order_id",
        sortable: true,
        sortOrder: "da",
      },
      {
        name: "order_time",
        align: "center",
        label: "주문 시각",
        field: "order_time",
      },
      {
        name: "user_name",
        align: "center",
        label: "닉네임",
        field: "user_name",
      },
      {
        name: "user_phone",
        align: "center",
        label: "전화번호",
        field: "user_phone",
      },
      {
        name: "user_password",
        align: "center",
        label: "비밀번호",
        field: "user_password",
      },
      {
        name: "user_location",
        align: "center",
        label: "방 호수",
        field: "user_location",
      },
    ];

    var retOrders = ref([]);
    function getOrders() {
      api
        .get("/order/selectAllOrders")
        .then((response) => {
          //console.log(response.data);
          retOrders.value = response.data.orders;
        })
        .catch(() => {});
    }
    function getDateTimeString(dateString) {
      var dayString = ["일", "월", "화", "수", "목", "금", "토"];

      var dateObject = new Date(dateString);
      var year = dateObject.getFullYear().toString();
      var month = (dateObject.getMonth() + 1).toString();
      var date = dateObject.getDate().toString();
      var day = dayString[dateObject.getDay()];
      var hour = dateObject.getHours().toString();
      var minute = dateObject.getMinutes().toString();
      //var second = dateObject.getSeconds();

      var ret =
        year +
        "년 " +
        month +
        "월 " +
        date +
        "일 (" +
        day +
        ") " +
        hour.padStart(2, "0") +
        ":" +
        minute.padStart(2, "0");
      return ret;
    }

    function ds(string) {
      if (!string) {
        var empty = {};
        return empty;
      } else {
        return JSON.parse(string);
      }
    }

    function getStoreInfo(storeId) {
      return allStores.value[parseInt(storeId)];
    }

    function getMenuInfo(menuId) {
      return allMenus.value[parseInt(menuId)];
    }

    function updateOrderToFinsh(orderId, orderInfo) {
      var query = "order/updateOrderToFinsh/" + orderId;
      api
        .put(query)
        .then((response) => {
          orderInfo.is_payed = 1;
        })
        .catch((error) => {});
    }

    function updateOrderToUnfinsh(orderId, orderInfo) {
      var query = "order/updateOrderToUnfinsh/" + orderId;
      api
        .put(query)
        .then((response) => {
          orderInfo.is_payed = 0;
        })
        .catch((error) => {});
    }
    function wrapCsvValue(val, formatFn, row) {
      let formatted = formatFn !== void 0 ? formatFn(val, row) : val;

      formatted =
        formatted === void 0 || formatted === null ? "" : String(formatted);

      formatted = formatted.split('"').join('""');
      /**
       * Excel accepts \n and \r in strings, but some other CSV parsers do not
       * Uncomment the next two lines to escape new lines
       */
      // .split('\n').join('\\n')
      // .split('\r').join('\\r')

      return `"${formatted}"`;
    }

    function getDetailInfo(content) {
      /*
      <div
                  v-for="(menu_id, menuIndex) in ds(props.row.menu_ids)"
                  :key="menuIndex"
                  class="column items-center"
                >
                  <q-card-section>
                    <div>
                      <div class="text-subtitle1 text-bold">
                        메뉴 {{ menuIndex + 1 }}:
                        {{ getMenuInfo(menu_id).menu_title }}
                      </div>
                      <div class="text-subtitle1 text-bold text-red">
                        수량: {{ ds(props.row.menu_numbers)[menuIndex] }}개
                      </div>
                      <div
                        v-for="(menu_option, optionIndex) in ds(
                          getMenuInfo(menu_id).menu_additional_options
                        )"
                        :key="optionIndex"
                      >
                        {{ menu_option.name }} :
                        {{
                          menu_option.options[
                            ds(props.row.menu_add_options)[menuIndex][
                              optionIndex
                            ]
                          ].label
                        }}
                      </div>
                    </div>
                  </q-card-section>
                </div>
      */
      retOrders.value.forEach((row, rowIndex) => {
        var menuDetailInfo = "";
        ds(row.menu_ids).forEach((menu_id, menuIndex) => {
          menuDetailInfo +=
            "메뉴 " +
            (menuIndex + 1).toString() +
            "번: " +
            getMenuInfo(menu_id).menu_title;
          menuDetailInfo +=
            " / 수량: " + ds(row.menu_numbers)[menuIndex] + "개 / ";
          ds(getMenuInfo(menu_id).menu_additional_options).forEach(
            (menu_option, optionIndex) => {
              menuDetailInfo +=
                menu_option.name +
                ": " +
                menu_option.options[
                  ds(row.menu_add_options)[menuIndex][optionIndex]
                ].label +
                " / ";
            }
          );
          menuDetailInfo += "  ////  ";
        });
        content[rowIndex + 1] = content[rowIndex + 1] + "," + menuDetailInfo;
      });

      return content;
    }

    onMounted(() => {
      getOrders();
    });

    return {
      getOrders,
      retOrders,
      columns,
      initialPagination: {
        rowsPerPage: 0,
      },
      getDateTimeString,
      ds,
      getStoreInfo,
      getMenuInfo,
      allMenus,
      updateOrderToFinsh,
      updateOrderToUnfinsh,
      exportTable() {
        // naive encoding to csv format
        var content = [columns.map((col) => wrapCsvValue(col.label))];
        content[0].push("메뉴 상세 정보");
        content = content.concat(
          retOrders.value.map((row) =>
            columns
              .map((col) =>
                wrapCsvValue(
                  typeof col.field === "function"
                    ? col.field(row)
                    : row[col.field === void 0 ? col.name : col.field],
                  col.format,
                  row
                )
              )
              .join(",")
          )
        );
        content = getDetailInfo(content);
        content = content.join("\r\n");
        //console.log(content);
        const status = exportFile("order_list.csv", content, "text/csv");
      },
    };
  },
});
</script>
