<!--<script>-->
<!--export default {-->
<!--  name: 'author-modal',-->
<!--  props: {-->
<!--    authorModal: {-->
<!--      type: Object }-->
<!--  },-->
<!--};-->
<!--</script>-->

<!--<template>-->
<!--  <b-modal-->
<!--    v-model="authorModal.show"-->
<!--    :id="authorModal.id"-->
<!--    :title="authorModal.title"-->
<!--    @cancel="cancel"-->
<!--    @close="cancel"-->
<!--    @ok="saveAuthor"-->
<!--  >-->
<!--    <div>-->
<!--      <b-form>-->
<!--        <b-form-group id="name-group" label="Name:" label-for="name">-->
<!--          <b-form-input id="name" placeholder="Enter name" required v-model="author.name"></b-form-input>-->
<!--        </b-form-group>-->
<!--        <div class="my-4">-->
<!--          <b-button variant="success" v-b-modal.add-book>Add Book</b-button>-->
<!--        </div>-->
<!--        <b-table-->
<!--          striped-->
<!--          hover-->
<!--          :items="[...authorBooks, ...addedAuthorBooks]"-->
<!--          :fields="bookFields"-->
<!--          :isBusy="loadingBooks"-->
<!--          selectable-->
<!--          @row-clicked="bookRowClicked"-->
<!--        >-->
<!--          <template #table-busy>-->
<!--            <div class="text-center text-danger my-2">-->
<!--              <b-spinner class="align-middle"></b-spinner>-->
<!--              <strong>Loading...</strong>-->
<!--            </div>-->
<!--          </template>-->
<!--        </b-table>-->
<!--      </b-form>-->
<!--    </div>-->
<!--  </b-modal>-->
<!--</template>-->

<!--<style scoped></style>-->
